import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type FindOperator } from 'typeorm';

import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { SubscriptionUpdateType } from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const STRIPE_CUSTOMER_ID = 'cus_123';
const STRIPE_SUBSCRIPTION_ID = 'sub_123';

const BASE_PRICE = {
  stripePriceId: 'price_base',
  interval: SubscriptionInterval.Year,
  billingProduct: {
    metadata: {
      productKey: BillingProductKey.BASE_PRODUCT,
      planKey: BillingPlanKey.PRO,
    },
  },
};

const buildResourceCreditPrice = (
  stripePriceId: string,
  unitAmount: number,
) => ({
  stripePriceId,
  unitAmount,
  currency: 'usd',
  interval: SubscriptionInterval.Year,
  metadata: { credit_amount: String(unitAmount) },
  billingProduct: {
    metadata: {
      productKey: BillingProductKey.RESOURCE_CREDIT,
      planKey: BillingPlanKey.PRO,
    },
  },
});

const CURRENT_CREDIT_PRICE = buildResourceCreditPrice('price_credit_small', 0);
const NEW_CREDIT_PRICE = buildResourceCreditPrice('price_credit_large', 5000);

const PRICES = [BASE_PRICE, CURRENT_CREDIT_PRICE, NEW_CREDIT_PRICE];

const findPrices = ({
  where: { stripePriceId },
}: {
  where: { stripePriceId: string | FindOperator<string[]> };
}) =>
  PRICES.filter((price) =>
    typeof stripePriceId === 'string'
      ? price.stripePriceId === stripePriceId
      : (stripePriceId.value as string[]).includes(price.stripePriceId),
  );

const buildSubscription = (
  collectionMethod: BillingSubscriptionCollectionMethod,
) => ({
  id: 'subscription-id',
  workspaceId: WORKSPACE_ID,
  stripeCustomerId: STRIPE_CUSTOMER_ID,
  stripeSubscriptionId: STRIPE_SUBSCRIPTION_ID,
  status: SubscriptionStatus.Active,
  interval: SubscriptionInterval.Year,
  collectionMethod,
  currentPeriodEnd: new Date('2027-01-01T00:00:00.000Z'),
  billingSubscriptionItems: [
    {
      stripeSubscriptionItemId: 'si_base',
      stripePriceId: BASE_PRICE.stripePriceId,
      billingProduct: BASE_PRICE.billingProduct,
    },
    {
      stripeSubscriptionItemId: 'si_credit',
      stripePriceId: CURRENT_CREDIT_PRICE.stripePriceId,
      billingProduct: CURRENT_CREDIT_PRICE.billingProduct,
    },
  ],
});

describe('BillingSubscriptionUpdateService', () => {
  let service: BillingSubscriptionUpdateService;
  let billingSubscriptionRepository: { findOneOrFail: jest.Mock };
  let stripeInvoiceService: {
    createImmediateUpgradeInvoice: jest.Mock;
    createPendingUpgradeInvoiceItem: jest.Mock;
  };

  beforeEach(async () => {
    billingSubscriptionRepository = { findOneOrFail: jest.fn() };
    stripeInvoiceService = {
      createImmediateUpgradeInvoice: jest.fn(),
      createPendingUpgradeInvoiceItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingSubscriptionUpdateService,
        {
          provide: StripeSubscriptionService,
          useValue: {
            updateSubscription: jest.fn().mockResolvedValue({
              items: { data: [{ current_period_end: 1798761600 }] },
            }),
          },
        },
        { provide: StripeInvoiceService, useValue: stripeInvoiceService },
        { provide: BillingPriceService, useValue: {} },
        { provide: BillingProductService, useValue: {} },
        {
          provide: getRepositoryToken(BillingPriceEntity),
          useValue: {
            find: jest.fn(async (options) => findPrices(options)),
            findOneOrFail: jest.fn(async (options) => findPrices(options)[0]),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: billingSubscriptionRepository,
        },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            loadSubscriptionSchedule: jest.fn().mockResolvedValue({
              subscription: {
                items: {
                  data: [
                    { price: { id: BASE_PRICE.stripePriceId }, quantity: 5 },
                    {
                      price: { id: CURRENT_CREDIT_PRICE.stripePriceId },
                      quantity: 1,
                    },
                  ],
                },
              },
            }),
          },
        },
        {
          provide: BillingSubscriptionService,
          useValue: { syncSubscriptionToDatabase: jest.fn() },
        },
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn().mockResolvedValue(5),
          },
        },
      ],
    }).compile();

    service = module.get(BillingSubscriptionUpdateService);
  });

  const upgradeResourceCredits = () =>
    service.updateSubscription(WORKSPACE_ID, 'subscription-id', {
      type: SubscriptionUpdateType.RESOURCE_CREDIT_PRICE,
      newResourceCreditPriceId: NEW_CREDIT_PRICE.stripePriceId,
    });

  it('adds the credit upgrade to the next grouped invoice for invoice-paying subscriptions', async () => {
    billingSubscriptionRepository.findOneOrFail.mockResolvedValue(
      buildSubscription(BillingSubscriptionCollectionMethod.SEND_INVOICE),
    );

    await upgradeResourceCredits();

    expect(
      stripeInvoiceService.createPendingUpgradeInvoiceItem,
    ).toHaveBeenCalledTimes(1);
    expect(
      stripeInvoiceService.createPendingUpgradeInvoiceItem,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeCustomerId: STRIPE_CUSTOMER_ID,
        stripeSubscriptionId: STRIPE_SUBSCRIPTION_ID,
        diffAmountInCents: 5000,
        currency: 'usd',
      }),
    );
    expect(
      stripeInvoiceService.createImmediateUpgradeInvoice,
    ).not.toHaveBeenCalled();
  });

  it('charges the credit upgrade immediately for card-paying subscriptions', async () => {
    billingSubscriptionRepository.findOneOrFail.mockResolvedValue(
      buildSubscription(
        BillingSubscriptionCollectionMethod.CHARGE_AUTOMATICALLY,
      ),
    );

    await upgradeResourceCredits();

    expect(
      stripeInvoiceService.createImmediateUpgradeInvoice,
    ).toHaveBeenCalledTimes(1);
    expect(
      stripeInvoiceService.createImmediateUpgradeInvoice,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeCustomerId: STRIPE_CUSTOMER_ID,
        stripeSubscriptionId: STRIPE_SUBSCRIPTION_ID,
        diffAmountInCents: 5000,
        currency: 'usd',
      }),
    );
    expect(
      stripeInvoiceService.createPendingUpgradeInvoiceItem,
    ).not.toHaveBeenCalled();
  });
});
