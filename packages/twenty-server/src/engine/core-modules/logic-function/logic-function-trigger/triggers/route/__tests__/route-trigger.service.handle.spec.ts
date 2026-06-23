import { type Request } from 'express';
import { HTTPMethod } from 'twenty-shared/types';

import { type AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { type WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { type LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const CUTOFF_ISO = '2026-06-25T00:00:00.000Z';
const BEFORE_CUTOFF = new Date('2026-01-01T00:00:00.000Z');
const AFTER_CUTOFF = new Date('2026-07-01T00:00:00.000Z');

describe('RouteTriggerService.handle', () => {
  const resolveWorkspaceAndPublicDomain = jest.fn();
  const buildPublicFunctionUrl = jest.fn();
  const find = jest.fn();
  const run = jest.fn();
  const getConfig = jest.fn();
  const validateTokenByRequest = jest.fn();

  const buildService = () =>
    new RouteTriggerService(
      { validateTokenByRequest } as unknown as AccessTokenService,
      { run } as unknown as LogicFunctionTriggerService,
      {
        resolveWorkspaceAndPublicDomain,
        buildPublicFunctionUrl,
      } as unknown as WorkspaceDomainsService,
      { get: getConfig } as unknown as TwentyConfigService,
      { find } as never,
    );

  const buildRequest = (): Request =>
    ({
      protocol: 'https',
      get: () => 'acme.withtwenty.com',
      path: '/s/webhook',
      headers: {},
      query: {},
      body: undefined,
      method: 'POST',
    }) as unknown as Request;

  const buildLogicFunction = (createdAt: Date): LogicFunctionEntity =>
    ({
      id: 'lf-1',
      workspaceId: 'workspace-1',
      httpRouteTriggerSettings: {
        path: '/webhook',
        httpMethod: HTTPMethod.POST,
        isAuthRequired: false,
      },
      createdAt,
    }) as unknown as LogicFunctionEntity;

  beforeEach(() => {
    resolveWorkspaceAndPublicDomain.mockReset();
    buildPublicFunctionUrl.mockReset();
    find.mockReset();
    run.mockReset();
    getConfig.mockReset();
    validateTokenByRequest.mockReset();

    run.mockResolvedValue({
      kind: 'response',
      response: { statusCode: 200, headers: {}, body: { ok: true } },
    });
    buildPublicFunctionUrl.mockReturnValue(
      'https://acme.withtwenty.com/webhook',
    );
  });

  it('serves from the isolated origin and forwards all headers, ignoring the cutoff', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: { id: 'workspace-1', subdomain: 'acme' },
      publicDomain: null,
      isIsolatedOrigin: true,
    });
    find.mockResolvedValue([buildLogicFunction(AFTER_CUTOFF)]);
    getConfig.mockReturnValue(CUTOFF_ISO);

    const result = await buildService().handle({
      request: buildRequest(),
      httpMethod: HTTPMethod.POST,
    });

    expect(result.isIsolatedOrigin).toBe(true);
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ forwardAllHeaders: true }),
    );
  });

  it('returns 410 on /s/ for a function created on or after the cutoff', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: { id: 'workspace-1', subdomain: 'acme' },
      publicDomain: null,
      isIsolatedOrigin: false,
    });
    find.mockResolvedValue([buildLogicFunction(AFTER_CUTOFF)]);
    getConfig.mockReturnValue(CUTOFF_ISO);

    await expect(
      buildService().handle({
        request: buildRequest(),
        httpMethod: HTTPMethod.POST,
      }),
    ).rejects.toMatchObject({
      code: RouteTriggerExceptionCode.LEGACY_ROUTE_DEPRECATED,
    });

    expect(run).not.toHaveBeenCalled();
  });

  it('still serves on /s/ a function created before the cutoff', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: { id: 'workspace-1', subdomain: 'acme' },
      publicDomain: null,
      isIsolatedOrigin: false,
    });
    find.mockResolvedValue([buildLogicFunction(BEFORE_CUTOFF)]);
    getConfig.mockReturnValue(CUTOFF_ISO);

    const result = await buildService().handle({
      request: buildRequest(),
      httpMethod: HTTPMethod.POST,
    });

    expect(result.isIsolatedOrigin).toBe(false);
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ forwardAllHeaders: false }),
    );
  });

  it('serves every function on /s/ when no cutoff is configured (self-hosting)', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: { id: 'workspace-1', subdomain: 'acme' },
      publicDomain: null,
      isIsolatedOrigin: false,
    });
    find.mockResolvedValue([buildLogicFunction(AFTER_CUTOFF)]);
    getConfig.mockReturnValue(undefined);

    await expect(
      buildService().handle({
        request: buildRequest(),
        httpMethod: HTTPMethod.POST,
      }),
    ).resolves.toBeDefined();
    expect(run).toHaveBeenCalled();
  });

  it('does not block /s/ when the cutoff is set but no public domain is configured', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: { id: 'workspace-1', subdomain: 'acme' },
      publicDomain: null,
      isIsolatedOrigin: false,
    });
    find.mockResolvedValue([buildLogicFunction(AFTER_CUTOFF)]);
    getConfig.mockReturnValue(CUTOFF_ISO);
    buildPublicFunctionUrl.mockReturnValue(undefined);

    await expect(
      buildService().handle({
        request: buildRequest(),
        httpMethod: HTTPMethod.POST,
      }),
    ).resolves.toBeDefined();
    expect(run).toHaveBeenCalled();
  });

  it('throws a RouteTriggerException when no workspace resolves', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: undefined,
      publicDomain: null,
      isIsolatedOrigin: true,
    });

    await expect(
      buildService().handle({
        request: buildRequest(),
        httpMethod: HTTPMethod.POST,
      }),
    ).rejects.toBeInstanceOf(RouteTriggerException);
  });
});
