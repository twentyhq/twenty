import { ApplicationHealthStatus } from 'twenty-shared/application';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { type ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { ApplicationRegistrationStatsService } from 'src/engine/core-modules/application/application-registration/application-registration-stats.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

jest.mock('src/database/clickhouse/clickhouse.service', () => ({
  ClickHouseService: class {},
}));
jest.mock(
  'src/engine/core-modules/application/application-health/application-health-cache.service',
  () => ({ ApplicationHealthCacheService: class {} }),
);
jest.mock('src/engine/core-modules/application/application.entity', () => ({
  ApplicationEntity: class {},
}));
jest.mock(
  'src/engine/metadata-modules/connected-account/entities/connected-account.entity',
  () => ({ ConnectedAccountEntity: class {} }),
);

const buildApplication = (
  overrides: Partial<ApplicationEntity> & {
    needsReconnection?: boolean;
    activationStatus?: WorkspaceActivationStatus;
  } = {},
) => ({
  id: 'application-id',
  workspaceId: 'workspace-id',
  version: '2.0.0',
  autoUpgrade: false,
  healthCheckLogicFunctionId: 'health-check-id',
  deletedAt: null,
  activationStatus: WorkspaceActivationStatus.ACTIVE,
  needsReconnection: false,
  ...overrides,
});

describe('ApplicationRegistrationStatsService', () => {
  const registration = {
    id: 'registration-id',
    latestAvailableVersion: '2.0.0',
  };
  const getRawMany = jest.fn();
  const getStatuses = jest.fn();
  const getMainClient = jest.fn();
  const selectOrThrow = jest.fn();
  let service: ApplicationRegistrationStatsService;

  beforeEach(() => {
    jest.clearAllMocks();
    const queryBuilder = {
      withDeleted: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany,
    };
    getRawMany.mockResolvedValue([]);
    getStatuses.mockResolvedValue([]);
    getMainClient.mockReturnValue({});
    selectOrThrow.mockResolvedValue([
      {
        resourceType: 'LOGIC_FUNCTION',
        operationType: 'CODE_EXECUTION',
        creditsUsedMicro: '12500000',
      },
    ]);
    service = new ApplicationRegistrationStatsService(
      {
        createQueryBuilder: () => queryBuilder,
      } as unknown as Repository<ApplicationEntity>,
      { getStatuses } as unknown as ApplicationHealthCacheService,
      { getMainClient, selectOrThrow } as unknown as ClickHouseService,
    );
  });

  it('compares semantic versions without counting newer or unknown versions as updates', async () => {
    getRawMany.mockResolvedValue([
      buildApplication({ version: '2.0.0', autoUpgrade: true }),
      buildApplication({ version: 'v2.0.0' }),
      buildApplication({
        version: '1.9.0',
        autoUpgrade: true,
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      }),
      buildApplication({ version: '2.0.0-beta.1' }),
      buildApplication({ version: '3.0.0' }),
      buildApplication({ version: null }),
    ]);

    expect(await service.computeStats(registration)).toMatchObject({
      activeInstalls: 6,
      suspendedInstalls: 1,
      onLatestVersion: 2,
      updatesAvailable: 2,
      autoUpdateEnabled: 2,
    });
  });

  it('includes historical installations in credits but excludes them from current adoption and health', async () => {
    const installed = buildApplication({ id: 'installed', autoUpgrade: true });
    getRawMany.mockResolvedValue([
      installed,
      buildApplication({
        id: 'uninstalled',
        deletedAt: new Date(),
        version: '1.0.0',
        autoUpgrade: true,
      }),
    ]);
    getStatuses.mockResolvedValue([ApplicationHealthStatus.OK]);

    expect(await service.computeStats(registration)).toMatchObject({
      activeInstalls: 1,
      onLatestVersion: 1,
      updatesAvailable: 0,
      autoUpdateEnabled: 1,
      healthCheckedWorkspaces: 1,
      totalCreditsConsumed: 12.5,
      versionDistribution: [{ version: '2.0.0', count: 1 }],
    });
    expect(getStatuses).toHaveBeenCalledWith([installed]);
    expect(selectOrThrow).toHaveBeenCalledWith(expect.any(String), {
      applicationIds: ['installed', 'uninstalled'],
      workspaceIds: ['workspace-id'],
    });
  });

  it('counts a workspace needing reconnection or reporting health issues once', async () => {
    getRawMany.mockResolvedValue([
      buildApplication({ needsReconnection: true }),
      buildApplication(),
      buildApplication(),
      buildApplication(),
      buildApplication(),
    ]);
    getStatuses.mockResolvedValue([
      ApplicationHealthStatus.ERROR,
      ApplicationHealthStatus.WARNING,
      ApplicationHealthStatus.OK,
      ApplicationHealthStatus.UNKNOWN,
      undefined,
    ]);

    expect(await service.computeStats(registration)).toMatchObject({
      workspacesNeedingAttention: 2,
      healthCheckedWorkspaces: 3,
    });
  });

  it('splits credits by billed resource without double counting explicit charges or workflow AI', async () => {
    getRawMany.mockResolvedValue([buildApplication()]);
    selectOrThrow.mockResolvedValue([
      {
        resourceType: 'AI',
        operationType: 'AI_CHAT_TOKEN',
        creditsUsedMicro: '50000000',
      },
      {
        resourceType: 'LOGIC_FUNCTION',
        operationType: 'CODE_EXECUTION',
        creditsUsedMicro: '3000000',
      },
      {
        resourceType: 'WORKFLOW',
        operationType: 'WORKFLOW_EXECUTION',
        creditsUsedMicro: '1000000',
      },
      {
        resourceType: 'AI',
        operationType: 'AI_WORKFLOW_TOKEN',
        creditsUsedMicro: '1000000',
      },
      {
        resourceType: 'APP',
        operationType: 'CODE_EXECUTION',
        creditsUsedMicro: '49300000',
      },
      {
        resourceType: 'APP',
        operationType: 'SUBSCRIPTION',
        creditsUsedMicro: '1000000',
      },
      {
        resourceType: 'API',
        operationType: 'API_REQUEST',
        creditsUsedMicro: '2000000',
      },
    ]);

    expect(await service.computeStats(registration)).toMatchObject({
      totalCreditsConsumed: 107.3,
      creditBreakdown: {
        agent: 50,
        logic: 3,
        workflow: 2,
        chargeCredits: 49.3,
        other: 3,
      },
    });
  });

  it('shows zero credit usage when the query succeeds with no recorded charges', async () => {
    getRawMany.mockResolvedValue([buildApplication()]);
    selectOrThrow.mockResolvedValue([]);

    expect(await service.computeStats(registration)).toMatchObject({
      totalCreditsConsumed: 0,
      creditBreakdown: {
        agent: 0,
        logic: 0,
        workflow: 0,
        chargeCredits: 0,
        other: 0,
      },
    });
  });

  it('does not describe unchecked workspaces as healthy', async () => {
    getRawMany.mockResolvedValue([buildApplication(), buildApplication()]);
    getStatuses.mockResolvedValue([undefined, ApplicationHealthStatus.UNKNOWN]);

    expect(await service.computeStats(registration)).toMatchObject({
      workspacesNeedingAttention: null,
      healthCheckedWorkspaces: 0,
    });
  });

  it('reports stored authentication failures even without health checks', async () => {
    getRawMany.mockResolvedValue([
      buildApplication({ needsReconnection: true }),
    ]);
    getStatuses.mockResolvedValue([undefined]);

    expect(await service.computeStats(registration)).toMatchObject({
      workspacesNeedingAttention: 1,
      healthCheckedWorkspaces: 0,
    });
  });

  it.each([null, 'not-a-version'])(
    'does not infer updates when latest version is %s',
    async (latestAvailableVersion) => {
      getRawMany.mockResolvedValue([buildApplication()]);

      expect(
        await service.computeStats({ ...registration, latestAvailableVersion }),
      ).toMatchObject({
        onLatestVersion: null,
        updatesAvailable: null,
      });
    },
  );

  it('returns an empty snapshot without querying usage for an app never installed', async () => {
    expect(await service.computeStats(registration)).toMatchObject({
      activeInstalls: 0,
      onLatestVersion: 0,
      updatesAvailable: 0,
      autoUpdateEnabled: 0,
      workspacesNeedingAttention: 0,
      healthCheckedWorkspaces: 0,
      totalCreditsConsumed: 0,
      mostInstalledVersion: null,
      versionDistribution: [],
    });
    expect(selectOrThrow).not.toHaveBeenCalled();
  });

  it('keeps installation statistics available when usage storage is not configured', async () => {
    getRawMany.mockResolvedValue([buildApplication()]);
    getMainClient.mockReturnValue(undefined);

    expect(await service.computeStats(registration)).toMatchObject({
      activeInstalls: 1,
      totalCreditsConsumed: null,
    });
    expect(selectOrThrow).not.toHaveBeenCalled();
  });

  it('does not turn usage query failures into zero credit consumption', async () => {
    getRawMany.mockResolvedValue([buildApplication()]);
    selectOrThrow.mockRejectedValue(new Error('Usage storage unavailable'));

    expect(await service.computeStats(registration)).toMatchObject({
      activeInstalls: 1,
      totalCreditsConsumed: null,
    });
  });
});
