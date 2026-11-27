import { MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795788995670-move-marketplace-application-role-holders-to-cloned-roles.command';
import { HandOverMarketplaceApplicationStandaloneRolesCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795788995671-hand-over-marketplace-application-standalone-roles.command';
import {
  APPLICATION,
  buildFlatRole,
  buildFlatRoleTarget,
  buildRequestedRoleFixture,
  buildRoleTargetAndAgentMaps,
  withFlatRoles,
  WORKSPACE_CUSTOM_APPLICATION,
} from 'src/database/commands/upgrade-version-command/2-66/utils/__tests__/marketplace-application-role.fixtures';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

const WORKSPACE_ID = 'workspace-id';

const buildWorkspaceCacheMaps = (
  requestedRoleOverrides: Partial<FlatRole> = {},
) => {
  const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();
  const standaloneFlatRole = buildFlatRole({
    universalIdentifier: 'standalone-role',
  });

  return {
    flatApplicationMaps: {
      byId: {
        [`${APPLICATION}-id`]: {
          id: `${APPLICATION}-id`,
          universalIdentifier: APPLICATION,
          sourceType: ApplicationRegistrationSourceType.NPM,
          requestedRoleId: requestedFlatRole.id,
          deletedAt: null,
        },
      },
    },
    ...withFlatRoles(flatEntityMaps, [
      { ...requestedFlatRole, ...requestedRoleOverrides },
      standaloneFlatRole,
    ]),
    ...buildRoleTargetAndAgentMaps({
      flatRoleTargets: [
        buildFlatRoleTarget({
          universalIdentifier: 'member',
          roleUniversalIdentifier: 'requested-role',
          userWorkspaceId: 'user-workspace-id',
        }),
      ],
      agents: [],
    }),
  };
};

const buildDependencies = (
  cacheMaps: ReturnType<typeof buildWorkspaceCacheMaps>,
) => ({
  workspaceCacheService: {
    getOrRecompute: jest.fn().mockResolvedValue(cacheMaps),
    invalidateAndRecompute: jest.fn(),
  },
  applicationService: {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
      .fn()
      .mockResolvedValue({
        workspaceCustomFlatApplication: {
          id: `${WORKSPACE_CUSTOM_APPLICATION}-id`,
          universalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
        },
      }),
  },
  validateBuildAndRunService: {
    validateBuildAndRunWorkspaceMigration: jest
      .fn()
      .mockResolvedValue({ status: 'success' }),
  },
  coreEntityCacheService: { invalidate: jest.fn() },
  coreDataSource: {
    query: jest.fn(async (sql: string) =>
      sql.includes('FROM core."workspace"')
        ? [{ defaultRoleId: 'requested-role-id' }]
        : [],
    ),
    transaction: jest.fn(),
  },
});

const runOptions = (dryRun: boolean) => ({
  workspaceId: WORKSPACE_ID,
  options: { dryRun },
  index: 0,
  total: 1,
});

const buildCloneCommand = (
  dependencies: ReturnType<typeof buildDependencies>,
) =>
  new MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand(
    {} as never,
    dependencies.workspaceCacheService as never,
    dependencies.applicationService as never,
    dependencies.validateBuildAndRunService as never,
    dependencies.coreEntityCacheService as never,
    dependencies.coreDataSource as never,
  );

const buildHandoverCommand = (
  dependencies: ReturnType<typeof buildDependencies>,
) =>
  new HandOverMarketplaceApplicationStandaloneRolesCommand(
    {} as never,
    dependencies.workspaceCacheService as never,
    dependencies.applicationService as never,
    dependencies.coreDataSource as never,
  );

const isWrite = (sql: string) => sql.trimStart().startsWith('UPDATE');

describe('MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand', () => {
  it('validates both builds without running them, and writes nothing, on a dry run', async () => {
    const dependencies = buildDependencies(buildWorkspaceCacheMaps());

    await buildCloneCommand(dependencies).runOnWorkspace(
      runOptions(true) as never,
    );

    const buildCalls =
      dependencies.validateBuildAndRunService
        .validateBuildAndRunWorkspaceMigration.mock.calls;

    expect(
      buildCalls.map(([args]) => [
        args.applicationUniversalIdentifier,
        args.dryRun,
      ]),
    ).toEqual([
      [WORKSPACE_CUSTOM_APPLICATION, true],
      [APPLICATION, true],
    ]);
    expect(
      dependencies.coreDataSource.query.mock.calls.filter(([sql]) =>
        isWrite(sql),
      ),
    ).toEqual([]);
    expect(
      dependencies.coreEntityCacheService.invalidate,
    ).not.toHaveBeenCalled();
  });

  it('moves the workspace default role to the clone after the clone build', async () => {
    const dependencies = buildDependencies(buildWorkspaceCacheMaps());

    await buildCloneCommand(dependencies).runOnWorkspace(
      runOptions(false) as never,
    );

    const [defaultRoleUpdate] =
      dependencies.coreDataSource.query.mock.calls.filter(([sql]) =>
        isWrite(sql),
      );

    expect(defaultRoleUpdate[0]).toContain('SET "defaultRoleId"');
    expect(dependencies.coreEntityCacheService.invalidate).toHaveBeenCalledWith(
      'workspaceEntity',
      WORKSPACE_ID,
    );
  });

  it('does nothing once the roles are migrated', async () => {
    const dependencies = buildDependencies(
      buildWorkspaceCacheMaps({
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        fieldPermissionUniversalIdentifiers: [],
        rowLevelPermissionRuleUniversalIdentifiers: [],
        rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
        rowLevelPermissionPredicateUniversalIdentifiers: [],
      }),
    );

    dependencies.coreDataSource.query.mockResolvedValue([]);
    dependencies.workspaceCacheService.getOrRecompute.mockResolvedValue({
      ...buildWorkspaceCacheMaps({
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        fieldPermissionUniversalIdentifiers: [],
        rowLevelPermissionRuleUniversalIdentifiers: [],
        rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
        rowLevelPermissionPredicateUniversalIdentifiers: [],
      }),
      ...buildRoleTargetAndAgentMaps({ flatRoleTargets: [], agents: [] }),
    });

    await buildCloneCommand(dependencies).runOnWorkspace(
      runOptions(false) as never,
    );

    expect(
      dependencies.validateBuildAndRunService
        .validateBuildAndRunWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('throws after the other applications when a build fails', async () => {
    const dependencies = buildDependencies(buildWorkspaceCacheMaps());

    dependencies.validateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
      { status: 'fail', report: {} },
    );

    await expect(
      buildCloneCommand(dependencies).runOnWorkspace(
        runOptions(false) as never,
      ),
    ).rejects.toThrow(APPLICATION);
  });
});

describe('HandOverMarketplaceApplicationStandaloneRolesCommand', () => {
  it('writes nothing on a dry run', async () => {
    const dependencies = buildDependencies(buildWorkspaceCacheMaps());

    await buildHandoverCommand(dependencies).runOnWorkspace(
      runOptions(true) as never,
    );

    expect(dependencies.coreDataSource.transaction).not.toHaveBeenCalled();
    expect(
      dependencies.workspaceCacheService.invalidateAndRecompute,
    ).not.toHaveBeenCalled();
  });

  it('hands over the standalone role only, then refreshes the role caches', async () => {
    const dependencies = buildDependencies(buildWorkspaceCacheMaps());
    const entityManager = { query: jest.fn() };

    dependencies.coreDataSource.transaction.mockImplementation(
      async (callback: (manager: typeof entityManager) => Promise<void>) =>
        callback(entityManager),
    );

    await buildHandoverCommand(dependencies).runOnWorkspace(
      runOptions(false) as never,
    );

    expect(entityManager.query.mock.calls.map(([, [, , id]]) => id)).toEqual([
      'standalone-role-id',
    ]);
    expect(
      dependencies.workspaceCacheService.invalidateAndRecompute,
    ).toHaveBeenCalled();
  });

  it('does nothing once the application owns no standalone role', async () => {
    const cacheMaps = buildWorkspaceCacheMaps();
    const dependencies = buildDependencies({
      ...cacheMaps,
      ...withFlatRoles(buildRequestedRoleFixture().flatEntityMaps, [
        buildRequestedRoleFixture().requestedFlatRole,
      ]),
    });

    await buildHandoverCommand(dependencies).runOnWorkspace(
      runOptions(false) as never,
    );

    expect(dependencies.coreDataSource.transaction).not.toHaveBeenCalled();
  });
});
