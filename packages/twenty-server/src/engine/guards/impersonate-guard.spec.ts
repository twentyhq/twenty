import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { expect, jest } from '@jest/globals';

import { ImpersonateGuard } from 'src/engine/guards/impersonate-guard';

describe('ImpersonateGuard', () => {
  const guard = new ImpersonateGuard();

  it('should return true if user can impersonate', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canImpersonate: true,
          },
        },
      })),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as any);

    const mockExecutionContext = {} as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
  });

  it('should return false if user cannot impersonate', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canImpersonate: false,
          },
        },
      })),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockContext as any);

    const mockExecutionContext = {} as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(false);
  });
});
