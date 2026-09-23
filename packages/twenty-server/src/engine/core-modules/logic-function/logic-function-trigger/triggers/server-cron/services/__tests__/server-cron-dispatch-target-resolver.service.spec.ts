import { ServerCronDispatchTargetResolverService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-target-resolver.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const INSTALLED_WORKSPACE_ID = 'installed-workspace-id';
const UNINSTALLED_WORKSPACE_ID = 'uninstalled-workspace-id';
const TARGET_UNIVERSAL_IDENTIFIER = 'target-universal-id';
const UNKNOWN_TARGET_UNIVERSAL_IDENTIFIER = 'unknown-target-universal-id';

describe('ServerCronDispatchTargetResolverService', () => {
  const getMany = jest.fn();
  const queryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany,
  };
  const createQueryBuilder = jest.fn(() => queryBuilder);

  const service = new ServerCronDispatchTargetResolverService({
    createQueryBuilder,
  } as unknown as WorkspaceScopedRepository<LogicFunctionEntity>);

  beforeEach(() => {
    jest.clearAllMocks();
    getMany.mockResolvedValue([
      {
        id: 'target-logic-function-id',
        workspaceId: INSTALLED_WORKSPACE_ID,
        universalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      },
    ]);
  });

  it('keeps dispatches whose target is installed from the same registration', async () => {
    const installedDispatch = {
      workspaceId: INSTALLED_WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payload: { bots: [] },
    };
    const uninstalledDispatch = {
      workspaceId: UNINSTALLED_WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    };
    const unknownTargetDispatch = {
      workspaceId: INSTALLED_WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier:
        UNKNOWN_TARGET_UNIVERSAL_IDENTIFIER,
    };

    const { resolvedDispatches, droppedDispatches } =
      await service.resolveDispatchTargets({
        applicationRegistrationId: 'registration-1',
        dispatches: [
          installedDispatch,
          uninstalledDispatch,
          unknownTargetDispatch,
        ],
      });

    expect(resolvedDispatches).toEqual([
      { ...installedDispatch, logicFunctionId: 'target-logic-function-id' },
    ]);
    expect(droppedDispatches).toEqual([
      uninstalledDispatch,
      unknownTargetDispatch,
    ]);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'logicFunction.workspaceId IN (:...workspaceIds)',
      { workspaceIds: [INSTALLED_WORKSPACE_ID, UNINSTALLED_WORKSPACE_ID] },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'application.applicationRegistrationId = :applicationRegistrationId',
      { applicationRegistrationId: 'registration-1' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'logicFunction.serverCronTriggerSettings IS NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'logicFunction.serverRouteTriggerSettings IS NULL',
    );
  });

  it('does not query without dispatches', async () => {
    const resolution = await service.resolveDispatchTargets({
      applicationRegistrationId: 'registration-1',
      dispatches: [],
    });

    expect(resolution).toEqual({
      resolvedDispatches: [],
      droppedDispatches: [],
    });
    expect(createQueryBuilder).not.toHaveBeenCalled();
  });
});
