import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { IngressTriggerService } from 'src/engine/core-modules/ingress-trigger/ingress-trigger.service';
import { IngressTriggerExceptionCode } from 'src/engine/core-modules/ingress-trigger/exceptions/ingress-trigger.exception';
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
    path: `/webhooks/ingress/${REGISTRATION_UID}/${LOGIC_FUNCTION_UID}`,
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
        ingressTriggerSettings: {
          workspaceId: { source: 'body', path: 'metadata.twentyWorkspaceId' },
        },
      },
    ],
  },
});

describe('IngressTriggerService', () => {
  let service: IngressTriggerService;
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

    service = new IngressTriggerService(
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
    expect(result).toEqual({ statusCode: 200, headers: {}, body: { ok: true } });
  });

  it('throws when the application registration does not exist', async () => {
    applicationRegistrationService.findOneByUniversalIdentifier.mockResolvedValue(
      null,
    );

    await expect(handle()).rejects.toMatchObject({
      code: IngressTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
    });
  });

  it('throws when the logic function has no webhook trigger settings', async () => {
    applicationRegistrationService.findOneByUniversalIdentifier.mockResolvedValue(
      asRegistration({ id: 'reg-1', manifest: { logicFunctions: [] } }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: IngressTriggerExceptionCode.INGRESS_TRIGGER_NOT_CONFIGURED,
    });
  });

  it('throws when the resolved workspaceId is not a valid uuid', async () => {
    await expect(
      handle({ metadata: { twentyWorkspaceId: 'not-a-uuid' } }),
    ).rejects.toMatchObject({
      code: IngressTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED,
    });
  });

  it('throws when the app is not installed in the resolved workspace', async () => {
    applicationRepository.findOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: IngressTriggerExceptionCode.WORKSPACE_NOT_FOUND,
    });
  });

  it('throws when the function is not installed in the workspace', async () => {
    logicFunctionRepository.findOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: IngressTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('surfaces a user uncaught error from the function', async () => {
    logicFunctionTriggerService.run.mockResolvedValue({
      kind: 'userError',
      errorMessage: 'boom',
    });

    await expect(handle()).rejects.toMatchObject({
      code: IngressTriggerExceptionCode.INGRESS_USER_UNCAUGHT_ERROR,
    });
  });
});
