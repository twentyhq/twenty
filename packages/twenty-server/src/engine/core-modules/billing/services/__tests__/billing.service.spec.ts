/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
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
          provide: getWorkspaceScopedRepositoryToken(
            BillingSubscriptionEntity,
          ),
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
    expect(findOne).toHaveBeenCalledWith(workspaceId, { where: {} });
  });

  it('does not throw when billing is on and a subscription row exists', async () => {
    getConfig.mockReturnValue(true);
    findOne.mockResolvedValue({ id: 'sub-row' });

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

  // v1 product decision (ADR): any subscription row clears the gate, including
  // Stripe Incomplete created by createSubscriptionPaymentIntent before card
  // succeeds. Documented paywall hole — tighten to active|trialing in a follow-up.
  it('v1: Incomplete subscription row still clears PLAN_REQUIRED (known gap)', async () => {
    getConfig.mockReturnValue(true);
    findOne.mockResolvedValue({
      id: 'sub-incomplete',
      status: 'incomplete',
    });

    await expect(
      service.assertWorkspaceHasRequiredPlan(workspaceId),
    ).resolves.toBeUndefined();
  });
});
