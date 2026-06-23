import { ServerCronTriggerDispatchJob } from 'src/engine/core-modules/server-cron-trigger/jobs/server-cron-trigger-dispatch.job';
import { ServerCronTriggerCronJob } from 'src/engine/core-modules/server-cron-trigger/server-cron-trigger.cron.job';

describe('ServerCronTriggerCronJob', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const buildJob = ({
    activeWorkspaces,
    logicFunctionsByWorkspace,
    featureEnabled = true,
  }: {
    activeWorkspaces: Array<{ id: string }>;
    logicFunctionsByWorkspace: Record<string, Array<Record<string, unknown>>>;
    featureEnabled?: boolean;
  }) => {
    const cronQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const workspaceRepository = {
      find: jest.fn().mockResolvedValue(activeWorkspaces),
    };
    const workspaceCacheService = {
      getOrRecompute: jest
        .fn()
        .mockImplementation(async (workspaceId: string) => ({
          flatLogicFunctionMaps: {
            byUniversalIdentifier: Object.fromEntries(
              (logicFunctionsByWorkspace[workspaceId] ?? []).map((lf) => [
                lf.id as string,
                lf,
              ]),
            ),
          },
        })),
    };
    const twentyConfigService = {
      get: jest.fn().mockReturnValue(featureEnabled),
    };

    const job = new ServerCronTriggerCronJob(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workspaceRepository as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workspaceCacheService as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cronQueueService as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      twentyConfigService as any,
    );

    return {
      job,
      cronQueueService,
      workspaceRepository,
      workspaceCacheService,
      twentyConfigService,
    };
  };

  it('enqueues a dispatch job per due server cron found through the workspace cache', async () => {
    const { job, cronQueueService } = buildJob({
      activeWorkspaces: [{ id: 'ws-owner' }],
      logicFunctionsByWorkspace: {
        'ws-owner': [
          {
            id: 'lf-1',
            deletedAt: null,
            serverCronTriggerSettings: {
              pattern: '* * * * *',
              targetLogicFunctionUniversalIdentifier: 'target-uid',
            },
          },
        ],
      },
    });

    await job.handle();

    expect(cronQueueService.add).toHaveBeenCalledWith(
      ServerCronTriggerDispatchJob.name,
      {
        resolverLogicFunctionId: 'lf-1',
        ownerWorkspaceId: 'ws-owner',
        targetLogicFunctionUniversalIdentifier: 'target-uid',
      },
      { retryLimit: 3 },
    );
  });

  it('returns early when the feature is disabled', async () => {
    const { job, cronQueueService, workspaceRepository } = buildJob({
      activeWorkspaces: [],
      logicFunctionsByWorkspace: {},
      featureEnabled: false,
    });

    await job.handle();

    expect(workspaceRepository.find).not.toHaveBeenCalled();
    expect(cronQueueService.add).not.toHaveBeenCalled();
  });

  it('skips rows whose cron pattern does not match the current minute', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-23T10:30:00.000Z'));

    const { job, cronQueueService } = buildJob({
      activeWorkspaces: [{ id: 'ws-owner' }],
      logicFunctionsByWorkspace: {
        'ws-owner': [
          {
            id: 'lf-1',
            deletedAt: null,
            serverCronTriggerSettings: {
              pattern: '0 0 * * 0',
              targetLogicFunctionUniversalIdentifier: 'target-uid',
            },
          },
        ],
      },
    });

    await job.handle();

    expect(cronQueueService.add).not.toHaveBeenCalled();
  });

  it('ignores logic functions that lack server cron settings or a target identifier', async () => {
    const { job, cronQueueService } = buildJob({
      activeWorkspaces: [{ id: 'ws-owner' }],
      logicFunctionsByWorkspace: {
        'ws-owner': [
          {
            id: 'lf-without-server-cron',
            deletedAt: null,
            cronTriggerSettings: { pattern: '* * * * *' },
          },
          {
            id: 'lf-without-target',
            deletedAt: null,
            serverCronTriggerSettings: { pattern: '* * * * *' },
          },
          {
            id: 'lf-deleted',
            deletedAt: new Date(),
            serverCronTriggerSettings: {
              pattern: '* * * * *',
              targetLogicFunctionUniversalIdentifier: 'target-uid',
            },
          },
        ],
      },
    });

    await job.handle();

    expect(cronQueueService.add).not.toHaveBeenCalled();
  });

  it('continues iterating workspaces when one workspace cache lookup fails', async () => {
    const cronQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const workspaceRepository = {
      find: jest.fn().mockResolvedValue([{ id: 'ws-broken' }, { id: 'ws-ok' }]),
    };
    const workspaceCacheService = {
      getOrRecompute: jest
        .fn()
        .mockImplementation(async (workspaceId: string) => {
          if (workspaceId === 'ws-broken') {
            throw new Error('cache miss');
          }

          return {
            flatLogicFunctionMaps: {
              byUniversalIdentifier: {
                'lf-ok': {
                  id: 'lf-ok',
                  deletedAt: null,
                  serverCronTriggerSettings: {
                    pattern: '* * * * *',
                    targetLogicFunctionUniversalIdentifier: 'target-uid',
                  },
                },
              },
            },
          };
        }),
    };
    const twentyConfigService = { get: jest.fn().mockReturnValue(true) };

    const job = new ServerCronTriggerCronJob(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workspaceRepository as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workspaceCacheService as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cronQueueService as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      twentyConfigService as any,
    );

    await job.handle();

    expect(cronQueueService.add).toHaveBeenCalledTimes(1);
    expect(cronQueueService.add).toHaveBeenCalledWith(
      ServerCronTriggerDispatchJob.name,
      expect.objectContaining({
        resolverLogicFunctionId: 'lf-ok',
        ownerWorkspaceId: 'ws-ok',
      }),
      { retryLimit: 3 },
    );
  });
});
