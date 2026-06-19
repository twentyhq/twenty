import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { ApplicationRegistrationWebhookService } from 'src/engine/core-modules/application-registration-webhook/application-registration-webhook.service';
import { ApplicationRegistrationWebhookExceptionCode } from 'src/engine/core-modules/application-registration-webhook/exceptions/application-registration-webhook.exception';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const REGISTRATION_UID = 'reg-universal-id';
const LOGIC_FUNCTION_UID = 'lf-universal-id';
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

const buildRequest = (body: object | null): Request =>
  ({
    method: 'POST',
    path: `/webhooks/application-registrations/${REGISTRATION_UID}/${LOGIC_FUNCTION_UID}`,
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

const REGISTRATION_WITH_INGRESS = asRegistration({
  id: 'reg-1',
  manifest: {
    application: {
      webhookIngress: {
        workspaceId: { source: 'body', path: 'metadata.twentyWorkspaceId' },
      },
    },
  },
});

describe('ApplicationRegistrationWebhookService', () => {
  let service: ApplicationRegistrationWebhookService;
  let applicationRegistrationService: jest.Mocked<
    Pick<ApplicationRegistrationService, 'findOneByUniversalIdentifier'>
  >;
  let logicFunctionExecutorService: jest.Mocked<
    Pick<LogicFunctionExecutorService, 'execute'>
  >;
  let logicFunctionRepository: jest.Mocked<
    Pick<Repository<LogicFunctionEntity>, 'findOne'>
  >;
  let applicationRepository: jest.Mocked<
    Pick<Repository<ApplicationEntity>, 'findOne'>
  >;

  const handle = (body: object | null = { metadata: { twentyWorkspaceId: WORKSPACE_ID } }) =>
    service.handle({
      request: buildRequest(body),
      applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
      logicFunctionUniversalIdentifier: LOGIC_FUNCTION_UID,
    });

  beforeEach(() => {
    applicationRegistrationService = {
      findOneByUniversalIdentifier: jest
        .fn()
        .mockResolvedValue(REGISTRATION_WITH_INGRESS),
    };
    logicFunctionExecutorService = {
      execute: jest.fn().mockResolvedValue({ data: { ok: true } }),
    };
    logicFunctionRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'lf-1',
        httpRouteTriggerSettings: { forwardedRequestHeaders: [] },
      }),
    };
    applicationRepository = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'app-1', workspaceId: WORKSPACE_ID }),
    };

    service = new ApplicationRegistrationWebhookService(
      applicationRegistrationService as unknown as ApplicationRegistrationService,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      applicationRepository as unknown as Repository<ApplicationEntity>,
    );
  });

  it('resolves the workspace and executes the function synchronously', async () => {
    const result = await handle();

    expect(applicationRepository.findOne).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID, applicationRegistrationId: 'reg-1' },
    });
    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: 'lf-1',
        workspaceId: WORKSPACE_ID,
      }),
    );
    expect(result).toEqual({ statusCode: 200, headers: {}, body: { ok: true } });
  });

  it('throws when the application registration does not exist', async () => {
    applicationRegistrationService.findOneByUniversalIdentifier.mockResolvedValue(
      null,
    );

    await expect(handle()).rejects.toMatchObject({
      code: ApplicationRegistrationWebhookExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
    });
  });

  it('throws when webhook ingress is not configured', async () => {
    applicationRegistrationService.findOneByUniversalIdentifier.mockResolvedValue(
      asRegistration({ id: 'reg-1', manifest: { application: {} } }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ApplicationRegistrationWebhookExceptionCode.WEBHOOK_INGRESS_NOT_CONFIGURED,
    });
  });

  it('throws when the resolved workspaceId is not a valid uuid', async () => {
    await expect(
      handle({ metadata: { twentyWorkspaceId: 'not-a-uuid' } }),
    ).rejects.toMatchObject({
      code: ApplicationRegistrationWebhookExceptionCode.WORKSPACE_ID_NOT_RESOLVED,
    });
  });

  it('throws when the app is not installed in the resolved workspace', async () => {
    applicationRepository.findOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: ApplicationRegistrationWebhookExceptionCode.WORKSPACE_NOT_FOUND,
    });
  });

  it('throws when no webhook-triggerable function matches the universalIdentifier', async () => {
    logicFunctionRepository.findOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: ApplicationRegistrationWebhookExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('surfaces a user uncaught error from the function', async () => {
    logicFunctionExecutorService.execute.mockResolvedValue({
      error: { errorMessage: 'boom' },
    } as Awaited<ReturnType<LogicFunctionExecutorService['execute']>>);

    await expect(handle()).rejects.toMatchObject({
      code: ApplicationRegistrationWebhookExceptionCode.WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });
});
