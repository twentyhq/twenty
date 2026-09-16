/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('BillingService.assertWorkspaceHasRequiredPlan', () => {
  let service: BillingService;

  const workspaceId = 'workspace-id';
  const findOne = jest.fn();
  const getConfig = jest.fn();

  beforeEach(async () => {
    findOne.mockReset();
    getConfig.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: TwentyConfigService, useValue: { get: getConfig } },
        { provide: BillingSubscriptionService, useValue: {} },
        { provide: BillingProductService, useValue: {} },
        { provide: StripeCustomerService, useValue: {} },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: { findOne },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(BillingService);
  });

  it('does not throw when IS_BILLING_ENABLED is false, even with no subscription', async () => {
    getConfig.mockReturnValue(false);

    await expect(
      service.assertWorkspaceHasRequiredPlan(workspaceId),
    ).resolves.toBeUndefined();
    expect(findOne).not.toHaveBeenCalled();
  });

  it('throws BILLING_PLAN_REQUIRED when billing is on and no subscription row exists', async () => {
    getConfig.mockReturnValue(true);
    findOne.mockResolvedValue(null);

    await expect(
      service.assertWorkspaceHasRequiredPlan(workspaceId),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
      statusCode: 402,
    });
    expect(findOne).toHaveBeenCalled();
  });

  it('does not throw when billing is on and an active subscription exists', async () => {
    getConfig.mockReturnValue(true);
    findOne.mockResolvedValue({
      id: 'sub-row',
      status: SubscriptionStatus.Active,
    });

    await expect(
      service.assertWorkspaceHasRequiredPlan(workspaceId),
    ).resolves.toBeUndefined();
  });

  it('throws a BillingException instance (filter-compatible)', async () => {
    getConfig.mockReturnValue(true);
    findOne.mockResolvedValue(null);

    await expect(
      service.assertWorkspaceHasRequiredPlan(workspaceId),
    ).rejects.toBeInstanceOf(BillingException);
  });

  it('throws when only an Incomplete Stripe checkout row exists', async () => {
    getConfig.mockReturnValue(true);
    // findOne with status In(active|trialing|...) returns null for Incomplete-only
    findOne.mockResolvedValue(null);

    await expect(
      service.assertWorkspaceHasRequiredPlan(workspaceId),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });

    expect(findOne).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        where: expect.objectContaining({
          status: expect.anything(),
        }),
      }),
    );
  });

  it('does not throw for trialing / past_due / unpaid statuses', async () => {
    getConfig.mockReturnValue(true);

    for (const status of [
      SubscriptionStatus.Trialing,
      SubscriptionStatus.PastDue,
      SubscriptionStatus.Unpaid,
    ]) {
      findOne.mockResolvedValue({ id: `sub-${status}`, status });

      await expect(
        service.assertWorkspaceHasRequiredPlan(workspaceId),
      ).resolves.toBeUndefined();
    }
  });
});
