import { createHmac } from 'crypto';

import { type Request } from 'express';
import { type SharedWebhookIngressSettings } from 'twenty-shared/application';
import { type Repository } from 'typeorm';
import {
  HTTPMethod,
  LOGIC_FUNCTION_HTTP_RESPONSE_MARKER,
} from 'twenty-shared/types';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  buildRouteTriggerResponse,
  RouteTriggerService,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { RouteTriggerExceptionCode } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000002';
const LOGIC_FUNCTION_ID = '20202020-0000-4000-8000-000000000003';
const APPLICATION_REGISTRATION_ID = '20202020-0000-4000-8000-000000000004';
const OTHER_LOGIC_FUNCTION_ID = '20202020-0000-4000-8000-000000000005';
const OTHER_APPLICATION_REGISTRATION_ID =
  '20202020-0000-4000-8000-000000000006';
const WEBHOOK_SECRET_VARIABLE_NAME = 'WEBHOOK_SECRET';
const WEBHOOK_SECRET = `whsec_${Buffer.from('shared-secret').toString(
  'base64',
)}`;

type RouteTriggerServiceTestContext = {
  service: RouteTriggerService;
  accessTokenService: { validateTokenByRequest: jest.Mock };
  logicFunctionExecutorService: { execute: jest.Mock };
  workspaceDomainsService: { resolveWorkspaceAndPublicDomain: jest.Mock };
  logicFunctionRepository: { find: jest.Mock };
  workspaceRepository: { findOneBy: jest.Mock };
  applicationRegistrationVariableRepository: { findOne: jest.Mock };
  secretEncryptionService: { decryptVersioned: jest.Mock };
};

const createRouteTriggerServiceTestContext =
  (): RouteTriggerServiceTestContext => {
    const accessTokenService = {
      validateTokenByRequest: jest.fn(),
    };
    const logicFunctionExecutorService = {
      execute: jest.fn(),
    };
    const workspaceDomainsService = {
      resolveWorkspaceAndPublicDomain: jest.fn(),
    };
    const logicFunctionRepository = {
      find: jest.fn(),
    };
    const workspaceRepository = {
      findOneBy: jest.fn(),
    };
    const applicationRegistrationVariableRepository = {
      findOne: jest.fn(),
    };
    const secretEncryptionService = {
      decryptVersioned: jest.fn(),
    };

    return {
      service: new RouteTriggerService(
        accessTokenService as unknown as AccessTokenService,
        logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
        workspaceDomainsService as unknown as WorkspaceDomainsService,
        logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
        workspaceRepository as unknown as Repository<WorkspaceEntity>,
        applicationRegistrationVariableRepository as unknown as Repository<ApplicationRegistrationVariableEntity>,
        secretEncryptionService as unknown as SecretEncryptionService,
      ),
      accessTokenService,
      logicFunctionExecutorService,
      workspaceDomainsService,
      logicFunctionRepository,
      workspaceRepository,
      applicationRegistrationVariableRepository,
      secretEncryptionService,
    };
  };

const buildWebhookHeaders = ({
  rawBody,
  secret = WEBHOOK_SECRET,
}: {
  rawBody: string;
  secret?: string;
}): Record<string, string> => {
  const webhookId = 'webhook-id';
  const webhookTimestamp = String(Math.floor(Date.now() / 1000));
  const secretBytes = Buffer.from(secret.slice('whsec_'.length), 'base64');
  const signature = createHmac('sha256', secretBytes)
    .update(`${webhookId}.${webhookTimestamp}.${rawBody}`)
    .digest('base64');

  return {
    'webhook-id': webhookId,
    'webhook-timestamp': webhookTimestamp,
    'webhook-signature': `v1,${signature}`,
  };
};

const createRouteTriggerRequest = ({
  body = {
    data: {
      bot: {
        metadata: {
          twentyWorkspaceId: WORKSPACE_ID,
        },
      },
    },
  },
  path = '/s/webhook/example',
  headers,
}: {
  body?: unknown;
  path?: string;
  headers?: Record<string, string>;
} = {}): Request => {
  const rawBody = JSON.stringify(body);

  return {
    protocol: 'https',
    get: jest.fn().mockReturnValue('twenty.example.com'),
    path,
    method: 'POST',
    headers: headers ?? buildWebhookHeaders({ rawBody }),
    query: {},
    body,
    rawBody: Buffer.from(rawBody),
  } as unknown as Request;
};

const createSharedWebhookIngressSettings =
  (): SharedWebhookIngressSettings => ({
    tenantIdPaths: [
      'bot.metadata.twentyWorkspaceId',
      'data.bot.metadata.twentyWorkspaceId',
      'data.recording.metadata.twentyWorkspaceId',
      'data.metadata.twentyWorkspaceId',
    ],
    signatureVerification: {
      type: 'svix',
      secretApplicationRegistrationVariableName:
        WEBHOOK_SECRET_VARIABLE_NAME,
    },
  });

const createLogicFunction = ({
  sharedWebhookIngress,
  httpMethod = HTTPMethod.POST,
  logicFunctionId = LOGIC_FUNCTION_ID,
  applicationId = APPLICATION_ID,
  workspaceId = WORKSPACE_ID,
  applicationRegistrationId = APPLICATION_REGISTRATION_ID,
}: {
  sharedWebhookIngress?: SharedWebhookIngressSettings;
  httpMethod?: HTTPMethod;
  logicFunctionId?: string;
  applicationId?: string;
  workspaceId?: string;
  applicationRegistrationId?: string | null;
} = {}): LogicFunctionEntity =>
  ({
    id: logicFunctionId,
    workspaceId,
    applicationId,
    application: {
      applicationRegistrationId,
    },
    httpRouteTriggerSettings: {
      path: '/webhook/example',
      httpMethod,
      isAuthRequired: false,
      ...(sharedWebhookIngress ? { sharedWebhookIngress } : {}),
      forwardedRequestHeaders: ['webhook-id'],
    },
  }) as LogicFunctionEntity;

const mockConfiguredSharedWebhookSecret = (
  context: RouteTriggerServiceTestContext,
) => {
  context.applicationRegistrationVariableRepository.findOne.mockResolvedValue({
    encryptedValue: 'encrypted-webhook-secret',
  } as ApplicationRegistrationVariableEntity);
  context.secretEncryptionService.decryptVersioned.mockReturnValue(
    WEBHOOK_SECRET,
  );
};

describe('buildRouteTriggerResponse', () => {
  it('wraps a plain body with status 200 and no headers', () => {
    expect(buildRouteTriggerResponse({ message: 'hi' })).toEqual({
      statusCode: 200,
      headers: {},
      body: { message: 'hi' },
    });
  });

  it('passes through null/undefined as a 200 with that body', () => {
    expect(buildRouteTriggerResponse(null)).toEqual({
      statusCode: 200,
      headers: {},
      body: null,
    });
  });

  it('reads status, headers and body from a wrapped response', () => {
    const data = {
      [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
      body: '<h1>Hi</h1>',
      status: 201,
      headers: { 'Content-Type': 'text/html' },
    };

    expect(buildRouteTriggerResponse(data)).toEqual({
      statusCode: 201,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Hi</h1>',
    });
  });

  it('defaults a wrapped response without status/headers to 200 and {}', () => {
    const data = {
      [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
      body: { ok: true },
    };

    expect(buildRouteTriggerResponse(data)).toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });
});

describe('RouteTriggerService', () => {
  it('routes by workspace host when the host resolves a workspace', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest();
    const logicFunction = createLogicFunction();

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: { id: WORKSPACE_ID } as WorkspaceEntity,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find.mockResolvedValue([logicFunction]);
    context.logicFunctionExecutorService.execute.mockResolvedValue({
      data: { ok: true },
    });

    const response = await context.service.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    expect(
      context.applicationRegistrationVariableRepository.findOne,
    ).not.toHaveBeenCalled();
    expect(context.logicFunctionRepository.find).toHaveBeenCalledWith({
      where: {
        workspaceId: WORKSPACE_ID,
        httpRouteTriggerSettings: expect.anything(),
      },
    });
    expect(context.logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
      }),
    );
    expect(response).toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });

  it('falls back to signed shared webhook ingress when the host has no workspace', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest();
    const sharedWebhookIngress = createSharedWebhookIngressSettings();
    const logicFunction = createLogicFunction({ sharedWebhookIngress });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find
      .mockResolvedValueOnce([logicFunction])
      .mockResolvedValueOnce([logicFunction]);
    context.workspaceRepository.findOneBy.mockResolvedValue({
      id: WORKSPACE_ID,
    } as WorkspaceEntity);
    mockConfiguredSharedWebhookSecret(context);
    context.logicFunctionExecutorService.execute.mockResolvedValue({
      data: { ok: true },
    });

    const response = await context.service.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    expect(context.logicFunctionRepository.find).toHaveBeenNthCalledWith(1, {
      where: {
        httpRouteTriggerSettings: expect.anything(),
      },
      relations: {
        application: true,
      },
    });
    expect(
      context.applicationRegistrationVariableRepository.findOne,
    ).toHaveBeenCalledWith({
      where: {
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        key: WEBHOOK_SECRET_VARIABLE_NAME,
      },
    });
    expect(context.workspaceRepository.findOneBy).toHaveBeenCalledWith({
      id: WORKSPACE_ID,
    });
    expect(context.logicFunctionRepository.find).toHaveBeenNthCalledWith(2, {
      where: {
        workspaceId: WORKSPACE_ID,
        httpRouteTriggerSettings: expect.anything(),
      },
      relations: {
        application: true,
      },
    });
    expect(context.logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: expect.objectContaining({
          headers: {
            'webhook-id': 'webhook-id',
          },
          rawBody: JSON.stringify(request.body),
          body: request.body,
        }),
      }),
    );
    expect(response).toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });

  it('keeps trying signed shared webhook candidates until one matches the tenant app', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest();
    const unmatchedLogicFunction = createLogicFunction({
      logicFunctionId: OTHER_LOGIC_FUNCTION_ID,
      applicationRegistrationId: OTHER_APPLICATION_REGISTRATION_ID,
      sharedWebhookIngress: {
        ...createSharedWebhookIngressSettings(),
        tenantIdPaths: ['metadata.unusedWorkspaceId'],
      },
    });
    const matchingLogicFunction = createLogicFunction({
      sharedWebhookIngress: createSharedWebhookIngressSettings(),
    });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find
      .mockResolvedValueOnce([unmatchedLogicFunction, matchingLogicFunction])
      .mockResolvedValueOnce([matchingLogicFunction]);
    context.workspaceRepository.findOneBy.mockResolvedValue({
      id: WORKSPACE_ID,
    } as WorkspaceEntity);
    mockConfiguredSharedWebhookSecret(context);
    context.logicFunctionExecutorService.execute.mockResolvedValue({
      data: { ok: true },
    });

    const response = await context.service.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    expect(
      context.applicationRegistrationVariableRepository.findOne,
    ).toHaveBeenCalledTimes(2);
    expect(context.workspaceRepository.findOneBy).toHaveBeenCalledWith({
      id: WORKSPACE_ID,
    });
    expect(context.logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
      }),
    );
    expect(response).toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });

  it('fails before tenant routing when shared webhook signature is invalid', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest({
      headers: {
        'webhook-id': 'webhook-id',
        'webhook-timestamp': String(Math.floor(Date.now() / 1000)),
        'webhook-signature': 'v1,invalid-signature',
      },
    });
    const logicFunction = createLogicFunction({
      sharedWebhookIngress: createSharedWebhookIngressSettings(),
    });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find.mockResolvedValue([logicFunction]);
    mockConfiguredSharedWebhookSecret(context);

    await expect(
      context.service.handle({
        request,
        httpMethod: HTTPMethod.POST,
      }),
    ).rejects.toMatchObject({
      code: RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
    });

    expect(context.workspaceRepository.findOneBy).not.toHaveBeenCalled();
    expect(context.logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });

  it('fails before tenant routing when shared webhook secret is not configured', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest();
    const logicFunction = createLogicFunction({
      sharedWebhookIngress: createSharedWebhookIngressSettings(),
    });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find.mockResolvedValue([logicFunction]);
    context.applicationRegistrationVariableRepository.findOne.mockResolvedValue(
      null,
    );

    await expect(
      context.service.handle({
        request,
        httpMethod: HTTPMethod.POST,
      }),
    ).rejects.toMatchObject({
      code: RouteTriggerExceptionCode.LOGIC_FUNCTION_EXECUTION_ERROR,
    });

    expect(context.workspaceRepository.findOneBy).not.toHaveBeenCalled();
    expect(context.logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });

  it('fails cleanly when the host has no workspace and no shared webhook route exists', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest({ body: { event: 'bot.done' } });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find.mockResolvedValue([]);

    await expect(
      context.service.handle({
        request,
        httpMethod: HTTPMethod.POST,
      }),
    ).rejects.toMatchObject({
      code: RouteTriggerExceptionCode.TRIGGER_NOT_FOUND,
    });

    expect(
      context.applicationRegistrationVariableRepository.findOne,
    ).not.toHaveBeenCalled();
    expect(context.logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });

  it('skips signed shared webhook events without tenant metadata', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest({ body: { event: 'bot.done' } });
    const logicFunction = createLogicFunction({
      sharedWebhookIngress: createSharedWebhookIngressSettings(),
    });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find.mockResolvedValue([logicFunction]);
    mockConfiguredSharedWebhookSecret(context);

    const response = await context.service.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {},
      body: {
        status: 'skipped',
        reason: 'shared webhook tenant id not found',
      },
    });
    expect(context.workspaceRepository.findOneBy).not.toHaveBeenCalled();
    expect(context.logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });

  it('skips signed shared webhook events with invalid tenant metadata', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest({
      body: {
        data: {
          bot: {
            metadata: {
              twentyWorkspaceId: 'not-a-uuid',
            },
          },
        },
      },
    });
    const logicFunction = createLogicFunction({
      sharedWebhookIngress: createSharedWebhookIngressSettings(),
    });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find.mockResolvedValue([logicFunction]);
    mockConfiguredSharedWebhookSecret(context);

    const response = await context.service.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {},
      body: {
        status: 'skipped',
        reason: 'shared webhook tenant id not found',
      },
    });
    expect(context.workspaceRepository.findOneBy).not.toHaveBeenCalled();
    expect(context.logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });

  it('skips signed shared webhook events when the tenant workspace no longer exists', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest();
    const logicFunction = createLogicFunction({
      sharedWebhookIngress: createSharedWebhookIngressSettings(),
    });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find.mockResolvedValue([logicFunction]);
    context.workspaceRepository.findOneBy.mockResolvedValue(null);
    mockConfiguredSharedWebhookSecret(context);

    const response = await context.service.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {},
      body: {
        status: 'skipped',
        reason: 'workspace not found',
      },
    });
    expect(context.logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });

  it('skips signed shared webhook events when the app is not installed in the tenant workspace', async () => {
    const context = createRouteTriggerServiceTestContext();
    const request = createRouteTriggerRequest();
    const logicFunction = createLogicFunction({
      sharedWebhookIngress: createSharedWebhookIngressSettings(),
    });

    context.workspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      {
        workspace: undefined,
        publicDomain: null,
      },
    );
    context.logicFunctionRepository.find
      .mockResolvedValueOnce([logicFunction])
      .mockResolvedValueOnce([]);
    context.workspaceRepository.findOneBy.mockResolvedValue({
      id: WORKSPACE_ID,
    } as WorkspaceEntity);
    mockConfiguredSharedWebhookSecret(context);

    const response = await context.service.handle({
      request,
      httpMethod: HTTPMethod.POST,
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {},
      body: {
        status: 'skipped',
        reason: 'shared webhook ingress trigger not found',
      },
    });
    expect(context.logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });
});
