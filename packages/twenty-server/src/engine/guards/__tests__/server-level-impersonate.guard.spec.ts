import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { ServerLevelImpersonateGuard } from 'src/engine/guards/server-level-impersonate.guard';

const mockRequest = (request: Record<string, unknown>) => {
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: request }),
  } as unknown as GqlExecutionContext);
};

const buildServerAdminAccessService = (isRequestAllowed: boolean) =>
  ({
    isRequestAllowed: jest.fn().mockReturnValue(isRequestAllowed),
  }) as unknown as ServerAdminAccessService;

const executionContext = {} as ExecutionContext;

describe('ServerLevelImpersonateGuard', () => {
  it('allows an impersonator whose request is on an allowed host', () => {
    const serverAdminAccessService = buildServerAdminAccessService(true);
    const request = {
      user: { canImpersonate: true, email: 'support@example.com' },
    };

    mockRequest(request);

    expect(
      new ServerLevelImpersonateGuard(serverAdminAccessService).canActivate(
        executionContext,
      ),
    ).toBe(true);
    expect(serverAdminAccessService.isRequestAllowed).toHaveBeenCalledWith(
      request,
    );
  });

  it('applies the server admin access checks to impersonators', () => {
    mockRequest({
      user: { canImpersonate: true, email: 'support@example.com' },
    });

    expect(
      new ServerLevelImpersonateGuard(
        buildServerAdminAccessService(false),
      ).canActivate(executionContext),
    ).toBe(false);
  });
});
