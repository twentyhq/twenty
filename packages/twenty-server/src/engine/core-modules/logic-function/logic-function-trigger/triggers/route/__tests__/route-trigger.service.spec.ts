import { type Request } from 'express';
import { HTTPMethod } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { RouteTriggerExceptionCode } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';

const workspace = {
  id: 'workspace-id',
  activationStatus: WorkspaceActivationStatus.ACTIVE,
  subdomain: 'apple',
};

const request = {
  protocol: 'https',
  get: () => 'apple.twenty.com',
  path: '/probe',
  headers: { authorization: 'Bearer token' },
} as unknown as Request;

const buildService = (authenticationContext: Record<string, unknown>) => {
  const logicFunctionTriggerService = {
    run: jest
      .fn()
      .mockResolvedValue({ kind: 'success', response: { status: 200 } }),
  };

  const service = new RouteTriggerService(
    {
      validateTokenByRequest: jest
        .fn()
        .mockResolvedValue(authenticationContext),
    } as never,
    logicFunctionTriggerService as never,
    {
      resolveWorkspaceAndPublicDomain: jest.fn().mockResolvedValue({
        workspace,
        publicDomain: undefined,
        isPublicDomain: false,
      }),
    } as never,
    { get: jest.fn() } as never,
    {
      find: jest.fn().mockResolvedValue([
        {
          id: 'logic-function-id',
          createdAt: new Date(),
          httpRouteTriggerSettings: {
            path: '/probe',
            httpMethod: HTTPMethod.GET,
            isAuthRequired: true,
            forwardedRequestHeaders: [],
          },
        },
      ]),
    } as never,
  );

  return { service, logicFunctionTriggerService };
};

describe('RouteTriggerService', () => {
  const userAuthenticationContext = {
    workspace,
    userWorkspaceId: 'user-workspace-id',
    user: { id: 'user-id' },
  };

  it('should refuse a token bound to an agent on a route that requires auth', async () => {
    const { service, logicFunctionTriggerService } = buildService({
      ...userAuthenticationContext,
      agentId: 'agent-id',
    });

    await expect(
      service.handle({ request, httpMethod: HTTPMethod.GET }),
    ).rejects.toMatchObject({
      code: RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
    });
    expect(logicFunctionTriggerService.run).not.toHaveBeenCalled();
  });

  it('should run the route for the same token without an agent', async () => {
    const { service, logicFunctionTriggerService } = buildService(
      userAuthenticationContext,
    );

    await expect(
      service.handle({ request, httpMethod: HTTPMethod.GET }),
    ).resolves.toEqual({ response: { status: 200 }, isPublicDomain: false });
    expect(logicFunctionTriggerService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id',
        userWorkspaceId: 'user-workspace-id',
      }),
    );
  });
});
