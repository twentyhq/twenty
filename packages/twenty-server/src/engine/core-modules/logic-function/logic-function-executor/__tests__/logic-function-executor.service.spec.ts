import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const OWNER_WORKSPACE_ID = 'owner-workspace-id';
const CUSTOMER_WORKSPACE_ID = 'customer-workspace-id';

describe('LogicFunctionExecutorService server-level owner guard', () => {
  const getOrRecompute = jest.fn();
  const isApplicationStopped = jest.fn();
  const findApplicationRegistration = jest.fn();

  const executorService = new LogicFunctionExecutorService(
    ...([
      {},
      {},
      {},
      {},
      { getOrRecompute },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { isApplicationStopped },
      {},
      {},
      { findOne: findApplicationRegistration },
    ] as unknown as ConstructorParameters<typeof LogicFunctionExecutorService>),
  );

  const mockLogicFunction = ({
    serverCronTriggerSettings = null,
    serverRouteTriggerSettings = null,
    applicationRegistrationId = 'registration-1',
  }: {
    serverCronTriggerSettings?: object | null;
    serverRouteTriggerSettings?: object | null;
    applicationRegistrationId?: string | null;
  }) =>
    getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: {
        universalIdentifierById: { 'logic-function-id': 'logic-function-uid' },
        byUniversalIdentifier: {
          'logic-function-uid': {
            id: 'logic-function-id',
            universalIdentifier: 'logic-function-uid',
            applicationId: 'application-id',
            deletedAt: null,
            serverCronTriggerSettings,
            serverRouteTriggerSettings,
          },
        },
      },
      flatApplicationMaps: {
        byId: {
          'application-id': {
            id: 'application-id',
            universalIdentifier: 'application-uid',
            applicationRegistrationId,
          },
        },
      },
      applicationVariableMaps: {},
    });

  const execute = (workspaceId: string) =>
    executorService.execute({
      logicFunctionId: 'logic-function-id',
      workspaceId,
      payload: {},
    });

  beforeEach(() => {
    jest.clearAllMocks();
    isApplicationStopped.mockResolvedValue(true);
    findApplicationRegistration.mockResolvedValue({
      id: 'registration-1',
      ownerWorkspaceId: OWNER_WORKSPACE_ID,
    });
  });

  it.each([
    ['server cron', { serverCronTriggerSettings: { pattern: '30 4 * * *' } }],
    ['server route', { serverRouteTriggerSettings: {} }],
  ])(
    'rejects a %s function outside the owner workspace',
    async (_label, triggerSettings) => {
      mockLogicFunction(triggerSettings);

      await expect(execute(CUSTOMER_WORKSPACE_ID)).rejects.toMatchObject({
        constructor: LogicFunctionExecutionException,
        code: LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      });
      expect(isApplicationStopped).not.toHaveBeenCalled();
    },
  );

  it('rejects a server-level function without application registration', async () => {
    mockLogicFunction({
      serverCronTriggerSettings: { pattern: '30 4 * * *' },
      applicationRegistrationId: null,
    });

    await expect(execute(OWNER_WORKSPACE_ID)).rejects.toMatchObject({
      code: LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
    expect(findApplicationRegistration).not.toHaveBeenCalled();
  });

  it('lets a server-level function run in the owner workspace', async () => {
    mockLogicFunction({ serverCronTriggerSettings: { pattern: '30 4 * * *' } });

    await expect(execute(OWNER_WORKSPACE_ID)).rejects.toMatchObject({
      constructor: LogicFunctionException,
      code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    });
    expect(findApplicationRegistration).toHaveBeenCalledWith({
      where: { id: 'registration-1' },
      select: { id: true, ownerWorkspaceId: true },
    });
  });

  it('does not look up the registration for a per-workspace function', async () => {
    mockLogicFunction({});

    await expect(execute(CUSTOMER_WORKSPACE_ID)).rejects.toMatchObject({
      code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    });
    expect(findApplicationRegistration).not.toHaveBeenCalled();
  });
});
