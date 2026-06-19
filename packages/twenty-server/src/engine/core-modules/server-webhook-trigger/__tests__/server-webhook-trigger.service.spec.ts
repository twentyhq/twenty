import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { ServerWebhookTriggerExceptionCode } from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const REGISTRATION_UID = 'reg-universal-id';
const LOGIC_FUNCTION_UID = 'lf-universal-id';
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

const buildRequest = (body: object | null): Request =>
  ({
    method: 'POST',
    path: `/webhooks/server/${REGISTRATION_UID}/${LOGIC_FUNCTION_UID}`,
    query: {},
    headers: {},
    rawBody: Buffer.from(JSON.stringify(body ?? {}), 'utf-8'),
    body,
  }) as unknown as Request;

type RegistrationResult = Awaited<
  ReturnType<ApplicationRegistrationService['findOneByUniversalIdentifier']>
>;

const asRegistration = (value: object): RegistrationResult =>
  value as unknown as RegistrationResult;

const REGISTRATION_WITH_TRIGGER = asRegistration({
  id: 'reg-1',
  manifest: {
    logicFunctions: [
      {
        universalIdentifier: LOGIC_FUNCTION_UID,
        serverWebhookTriggerSettings: {
          workspaceIdResolver: {
            source: 'body',
            path: 'metadata.twentyWorkspaceId',
          },
        },
      },
    ],
  },
});

describe('ServerWebhookTriggerService', () => {
  let service: ServerWebhookTriggerService;
  let applicationRegistrationService: jest.Mocked<
    Pick<ApplicationRegistrationService, 'findOneByUniversalIdentifier'>
  >;
  let logicFunctionTriggerService: jest.Mocked<
    Pick<LogicFunctionTriggerService, 'run'>
  >;
  let logicFunctionRepository: jest.Mocked<
    Pick<Repository<LogicFunctionEntity>, 'findOne'>
  >;
  let applicationRepository: jest.Mocked<
    Pick<Repository<ApplicationEntity>, 'findOne'>
  >;

  const handle = (
    body: object | null = { metadata: { twentyWorkspaceId: WORKSPACE_ID } },
  ) =>
    service.handle({
      request: buildRequest(body),
      applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
      logicFunctionUniversalIdentifier: LOGIC_FUNCTION_UID,
    });

  beforeEach(() => {
    applicationRegistrationService = {
      findOneByUniversalIdentifier: jest
        .fn()
        .mockResolvedValue(REGISTRATION_WITH_TRIGGER),
    };
    logicFunctionTriggerService = {
      run: jest.fn().mockResolvedValue({
        kind: 'response',
        response: { statusCode: 200, headers: {}, body: { ok: true } },
      }),
    };
    logicFunctionRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'lf-1' }),
    };
    applicationRepository = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'app-1', workspaceId: WORKSPACE_ID }),
    };

    service = new ServerWebhookTriggerService(
      applicationRegistrationService as unknown as ApplicationRegistrationService,
      logicFunctionTriggerService as unknown as LogicFunctionTriggerService,
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      applicationRepository as unknown as Repository<ApplicationEntity>,
    );
  });

  it('resolves the workspace and runs the function synchronously', async () => {
    const result = await handle();

    expect(applicationRepository.findOne).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID, applicationRegistrationId: 'reg-1' },
    });
    expect(logicFunctionTriggerService.run).toHaveBeenCalledWith(
      expect.objectContaining({ logicFunction: { id: 'lf-1' } }),
    );
    expect(result).toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });

  it('throws when the application registration does not exist', async () => {
    applicationRegistrationService.findOneByUniversalIdentifier.mockResolvedValue(
      null,
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
    });
  });

  it('throws when the logic function has no webhook trigger settings', async () => {
    applicationRegistrationService.findOneByUniversalIdentifier.mockResolvedValue(
      asRegistration({ id: 'reg-1', manifest: { logicFunctions: [] } }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_TRIGGER_NOT_CONFIGURED,
    });
  });

  it('throws when the resolved workspaceId is not a valid uuid', async () => {
    await expect(
      handle({ metadata: { twentyWorkspaceId: 'not-a-uuid' } }),
    ).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED,
    });
  });

  it('throws when the app is not installed in the resolved workspace', async () => {
    applicationRepository.findOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.APPLICATION_NOT_INSTALLED,
    });
  });

  it('throws when the function is not installed in the workspace', async () => {
    logicFunctionRepository.findOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('surfaces a user uncaught error from the function', async () => {
    logicFunctionTriggerService.run.mockResolvedValue({
      kind: 'userError',
      errorMessage: 'boom',
    });

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });
});
