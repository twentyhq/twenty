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
    isRequestAllowed: jest.fn().mockResolvedValue(isRequestAllowed),
  }) as unknown as ServerAdminAccessService;

const executionContext = {} as ExecutionContext;

describe('ServerLevelImpersonateGuard', () => {
  it('allows an impersonator whose request passes the server admin access checks', async () => {
    mockRequest({
      user: { canImpersonate: true, email: 'support@example.com' },
    });

    await expect(
      new ServerLevelImpersonateGuard(
        buildServerAdminAccessService(true),
      ).canActivate(executionContext),
    ).resolves.toBe(true);
  });

  it('applies the server admin access checks to impersonators', async () => {
    mockRequest({
      user: { canImpersonate: true, email: 'support@example.com' },
    });

    await expect(
      new ServerLevelImpersonateGuard(
        buildServerAdminAccessService(false),
      ).canActivate(executionContext),
    ).resolves.toBe(false);
  });
});
