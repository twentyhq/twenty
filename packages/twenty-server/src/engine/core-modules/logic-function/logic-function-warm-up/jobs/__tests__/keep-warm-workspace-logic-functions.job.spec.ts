import { KeepWarmWorkspaceLogicFunctionsJob } from 'src/engine/core-modules/logic-function/logic-function-warm-up/jobs/keep-warm-workspace-logic-functions.job';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';

const buildFlatLogicFunction = (
  overrides: Record<string, unknown> & { id: string },
) => ({
  universalIdentifier: overrides.id,
  applicationId: 'active-application',
  isWarm: true,
  executionMode: LogicFunctionExecutionMode.PREBUILT,
  isBuildUpToDate: true,
  checksum: 'checksum',
  deletedAt: null,
  ...overrides,
});

describe('KeepWarmWorkspaceLogicFunctionsJob', () => {
  it('only warms up eligible functions of active applications', async () => {
    const flatLogicFunctions = [
      buildFlatLogicFunction({ id: 'warm' }),
      buildFlatLogicFunction({ id: 'not-warm', isWarm: false }),
      buildFlatLogicFunction({
        id: 'live',
        executionMode: LogicFunctionExecutionMode.LIVE,
      }),
      buildFlatLogicFunction({
        id: 'deleted',
        deletedAt: '2026-01-01T00:00:00.000Z',
      }),
      buildFlatLogicFunction({
        id: 'deleted-application',
        applicationId: 'deleted-application',
      }),
    ];

    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: Object.fromEntries(
            flatLogicFunctions.map((flatLogicFunction) => [
              flatLogicFunction.universalIdentifier,
              flatLogicFunction,
            ]),
          ),
        },
        flatApplicationMaps: {
          byId: {
            'active-application': { id: 'active-application', deletedAt: null },
            'deleted-application': {
              id: 'deleted-application',
              deletedAt: '2026-01-01T00:00:00.000Z',
            },
          },
        },
      }),
    } as unknown as WorkspaceCacheService;

    const warmUp = jest.fn().mockResolvedValue(undefined);

    const job = new KeepWarmWorkspaceLogicFunctionsJob(workspaceCacheService, {
      warmUp,
    } as unknown as LogicFunctionExecutorService);

    await job.handle({ workspaceId: WORKSPACE_ID });

    expect(warmUp).toHaveBeenCalledTimes(1);
    expect(warmUp).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      logicFunctionId: 'warm',
    });
  });
});
