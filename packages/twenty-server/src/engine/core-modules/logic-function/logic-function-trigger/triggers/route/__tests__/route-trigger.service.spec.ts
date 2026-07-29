import { type Request } from 'express';
import {
  HTTPMethod,
  LOGIC_FUNCTION_HTTP_RESPONSE_MARKER,
} from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import { type AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { type WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { type LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { RouteTriggerExceptionCode } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { buildRouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

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
  const resolveWorkspaceAndPublicDomain = jest.fn();
  const find = jest.fn();

  const service = new RouteTriggerService(
    {} as unknown as AccessTokenService,
    {} as unknown as LogicFunctionTriggerService,
    { resolveWorkspaceAndPublicDomain } as unknown as WorkspaceDomainsService,
    { get: jest.fn() } as unknown as TwentyConfigService,
    { find } as unknown as Repository<LogicFunctionEntity>,
  );

  const request = {
    protocol: 'https',
    get: () => 'acme.twenty.com',
    path: '/s/webhook',
  } as unknown as Request;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject requests when the workspace is suspended', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: {
        id: 'workspace-id',
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      },
      publicDomain: null,
      isIsolatedOrigin: false,
    });

    await expect(
      service.handle({ request, httpMethod: HTTPMethod.GET }),
    ).rejects.toMatchObject({
      code: RouteTriggerExceptionCode.WORKSPACE_SUSPENDED,
    });

    expect(find).not.toHaveBeenCalled();
  });

  it('should resolve route triggers when the workspace is active', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: {
        id: 'workspace-id',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      publicDomain: null,
      isIsolatedOrigin: false,
    });
    find.mockResolvedValue([]);

    await expect(
      service.handle({ request, httpMethod: HTTPMethod.GET }),
    ).rejects.toMatchObject({
      code: RouteTriggerExceptionCode.TRIGGER_NOT_FOUND,
    });

    expect(find).toHaveBeenCalledWith({
      where: {
        workspaceId: 'workspace-id',
        httpRouteTriggerSettings: expect.anything(),
      },
    });
  });
});
