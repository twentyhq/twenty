/* @license Enterprise */

import { type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SKIP_PLAN_REQUIRED_KEY } from 'src/engine/guards/decorators/skip-plan-required.decorator';
import { WorkspacePlanRequiredGuard } from 'src/engine/guards/workspace-plan-required.guard';

describe('WorkspacePlanRequiredGuard', () => {
  let guard: WorkspacePlanRequiredGuard;

  const getConfig = jest.fn();
  const assertWorkspaceHasRequiredPlan = jest.fn();
  const reflectorGetAllAndOverride = jest.fn();

  const buildContext = ({
    workspaceId,
  }: {
    workspaceId?: string;
  }): ExecutionContext => {
    const request = {
      workspace: workspaceId ? { id: workspaceId } : undefined,
    };

    return {
      getType: () => 'http',
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getArgs: () => [],
      getArgByIndex: () => undefined,
      switchToRpc: () => ({}) as never,
      switchToWs: () => ({}) as never,
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    getConfig.mockReset();
    assertWorkspaceHasRequiredPlan.mockReset();
    reflectorGetAllAndOverride.mockReset();
    reflectorGetAllAndOverride.mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacePlanRequiredGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: reflectorGetAllAndOverride },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: getConfig },
        },
        {
          provide: BillingService,
          useValue: { assertWorkspaceHasRequiredPlan },
        },
      ],
    }).compile();

    guard = module.get(WorkspacePlanRequiredGuard);
  });

  it('allows when there is no workspace on the request', async () => {
    getConfig.mockReturnValue(true);

    await expect(
      guard.canActivate(buildContext({ workspaceId: undefined })),
    ).resolves.toBe(true);
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('allows when enforcement flag is off', async () => {
    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return false;
      }

      return true;
    });

    await expect(
      guard.canActivate(buildContext({ workspaceId: 'ws-1' })),
    ).resolves.toBe(true);
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('allows when @SkipPlanRequired is set even if incomplete', async () => {
    getConfig.mockReturnValue(true);
    reflectorGetAllAndOverride.mockReturnValue(true);

    await expect(
      guard.canActivate(buildContext({ workspaceId: 'ws-1' })),
    ).resolves.toBe(true);
    expect(reflectorGetAllAndOverride).toHaveBeenCalledWith(
      SKIP_PLAN_REQUIRED_KEY,
      expect.any(Array),
    );
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('allows when assertWorkspaceHasRequiredPlan resolves', async () => {
    getConfig.mockReturnValue(true);
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);

    await expect(
      guard.canActivate(buildContext({ workspaceId: 'ws-1' })),
    ).resolves.toBe(true);
    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-1');
  });

  it('propagates BILLING_PLAN_REQUIRED from assert helper', async () => {
    getConfig.mockReturnValue(true);
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    await expect(
      guard.canActivate(buildContext({ workspaceId: 'ws-1' })),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
      statusCode: 402,
    });
  });
});
