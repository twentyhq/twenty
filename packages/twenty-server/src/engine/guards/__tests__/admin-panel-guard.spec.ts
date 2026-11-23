import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';

describe('AdminPanelGuard', () => {
  let guard: AdminPanelGuard;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminPanelGuard,
        { provide: TwentyConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    guard = moduleRef.get(AdminPanelGuard);
  });

  it('should return true if user can access full admin panel', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canAccessFullAdminPanel: true,
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

  it('should return false if user cannot access full admin panel', async () => {
    const mockContext = {
      getContext: jest.fn(() => ({
        req: {
          user: {
            canAccessFullAdminPanel: false,
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
