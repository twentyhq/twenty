import { ServerLogicFunctionExecutorExceptionCode } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.exception';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';

const REGISTRATION_UID = 'reg-uid';
const LOGIC_FN_UID = 'fn-uid';
const OWNER_WORKSPACE_ID = '22222222-2222-2222-2222-222222222222';

describe('ServerLogicFunctionExecutorService', () => {
  let service: ServerLogicFunctionExecutorService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let registrationRepository: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let registrationLogicFunctionRepository: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let applicationRepository: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logicFunctionRepository: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logicFunctionExecutorService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let twentyConfigService: any;

  const buildService = () =>
    new ServerLogicFunctionExecutorService(
      registrationRepository,
      registrationLogicFunctionRepository,
      applicationRepository,
      logicFunctionRepository,
      logicFunctionExecutorService,
      twentyConfigService,
    );

  beforeEach(() => {
    registrationRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'reg-1',
        ownerWorkspaceId: OWNER_WORKSPACE_ID,
      }),
    };
    registrationLogicFunctionRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'srv-1',
        universalIdentifier: LOGIC_FN_UID,
        applicationRegistrationId: 'reg-1',
        disabledAt: null,
        serverWebhookTriggerSettings: {},
        serverCronTriggerSettings: null,
      }),
    };
    applicationRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'app-1' }),
    };
    logicFunctionRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'lf-1' }),
    };
    logicFunctionExecutorService = {
      execute: jest.fn().mockResolvedValue({
        data: { ok: true },
        error: undefined,
      }),
    };
    twentyConfigService = { get: jest.fn().mockReturnValue(true) };
    service = buildService();
  });

  it('delegates to the executor with the owner workspace and forwards the payload', async () => {
    const payload = { headers: {}, body: { hello: 'world' } };
    const outcome = await service.run({
      applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
      logicFunctionUniversalIdentifier: LOGIC_FN_UID,
      payload,
    });

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith({
      logicFunctionId: 'lf-1',
      workspaceId: OWNER_WORKSPACE_ID,
      payload,
    });
    expect(outcome).toEqual({
      kind: 'response',
      response: { statusCode: 200, headers: {}, body: { ok: true } },
    });
  });

  it('refuses when the feature is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);

    await expect(
      service.run({
        applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
        logicFunctionUniversalIdentifier: LOGIC_FN_UID,
      }),
    ).rejects.toMatchObject({
      code: ServerLogicFunctionExecutorExceptionCode.FEATURE_DISABLED,
    });
  });

  it('refuses when the registration has no owner workspace', async () => {
    registrationRepository.findOne.mockResolvedValue({
      id: 'reg-1',
      ownerWorkspaceId: null,
    });

    await expect(
      service.run({
        applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
        logicFunctionUniversalIdentifier: LOGIC_FN_UID,
      }),
    ).rejects.toMatchObject({
      code: ServerLogicFunctionExecutorExceptionCode.OWNER_WORKSPACE_NOT_SET,
    });
  });

  it('refuses when the function is disabled', async () => {
    registrationLogicFunctionRepository.findOne.mockResolvedValue({
      id: 'srv-1',
      applicationRegistrationId: 'reg-1',
      disabledAt: new Date(),
    });

    await expect(
      service.run({
        applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
        logicFunctionUniversalIdentifier: LOGIC_FN_UID,
      }),
    ).rejects.toMatchObject({
      code: ServerLogicFunctionExecutorExceptionCode.FUNCTION_DISABLED,
    });
  });

  it('surfaces userError when the underlying executor returned an error', async () => {
    logicFunctionExecutorService.execute.mockResolvedValue({
      data: undefined,
      error: { errorMessage: 'boom' },
    });

    const outcome = await service.run({
      applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
      logicFunctionUniversalIdentifier: LOGIC_FN_UID,
    });

    expect(outcome).toEqual({ kind: 'userError', errorMessage: 'boom' });
  });
});
