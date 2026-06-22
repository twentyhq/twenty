import {
  ServerLogicFunctionExecutorException,
  ServerLogicFunctionExecutorExceptionCode,
} from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.exception';
import { ServerWebhookTriggerExceptionCode } from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';

describe('ServerWebhookTriggerService', () => {
  let service: ServerWebhookTriggerService;
  let executor: { run: jest.Mock };

  const handle = () =>
    service.handle({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: {
        headers: {},
        query: {},
        method: 'POST',
        path: '/x',
        body: {},
      } as any,
      applicationRegistrationUniversalIdentifier: 'reg',
      logicFunctionUniversalIdentifier: 'fn',
    });

  beforeEach(() => {
    executor = { run: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new ServerWebhookTriggerService(executor as any);
  });

  it('returns the response from the executor outcome', async () => {
    executor.run.mockResolvedValue({
      kind: 'response',
      workspaceIds: ['w'],
      response: { statusCode: 200, headers: {}, body: { ok: true } },
    });

    await expect(handle()).resolves.toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });

  it('maps a user error to a webhook exception', async () => {
    executor.run.mockResolvedValue({
      kind: 'userError',
      errorMessage: 'boom',
    });

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });

  it('maps an executor LOGIC_FUNCTION_NOT_FOUND to the webhook not-found code', async () => {
    executor.run.mockRejectedValue(
      new ServerLogicFunctionExecutorException(
        'not found',
        ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('maps an executor APP_NOT_INSTALLED_IN_OWNER_WORKSPACE to the webhook not-installed code', async () => {
    executor.run.mockRejectedValue(
      new ServerLogicFunctionExecutorException(
        'not installed',
        ServerLogicFunctionExecutorExceptionCode.APP_NOT_INSTALLED_IN_OWNER_WORKSPACE,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.APPLICATION_NOT_INSTALLED,
    });
  });

  it('falls back to PLATFORM_ERROR for other executor codes', async () => {
    executor.run.mockRejectedValue(
      new ServerLogicFunctionExecutorException(
        'disabled',
        ServerLogicFunctionExecutorExceptionCode.FEATURE_DISABLED,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_PLATFORM_ERROR,
    });
  });
});
