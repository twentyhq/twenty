import { type Repository } from 'typeorm';

import { type BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { type StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { type StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('BillingSubscriptionService', () => {
  it('should prefer an active subscription when multiple non-canceled subscriptions exist', async () => {
    const unpaidSubscription = {
      status: SubscriptionStatus.Unpaid,
      createdAt: new Date('2026-07-02'),
    } as unknown as BillingSubscriptionEntity;
    const activeSubscription = {
      status: SubscriptionStatus.Active,
      createdAt: new Date('2026-07-01'),
    } as unknown as BillingSubscriptionEntity;
    const billingSubscriptionRepository = {
      find: jest
        .fn()
        .mockResolvedValue([unpaidSubscription, activeSubscription]),
    } as unknown as jest.Mocked<Repository<BillingSubscriptionEntity>>;

    const service = new BillingSubscriptionService(
      {} as StripeSubscriptionService,
      {} as BillingPriceService,
      {} as BillingPlanService,
      {} as Repository<BillingEntitlementEntity>,
      billingSubscriptionRepository,
      {} as StripeCustomerService,
      {} as TwentyConfigService,
      {} as Repository<BillingSubscriptionItemEntity>,
      {} as StripeSubscriptionScheduleService,
      billingSubscriptionRepository,
      {} as EnterprisePlanService,
    );

    await expect(
      service.getCurrentBillingSubscription({ workspaceId: 'workspace-id' }),
    ).resolves.toBe(activeSubscription);
  });
});
