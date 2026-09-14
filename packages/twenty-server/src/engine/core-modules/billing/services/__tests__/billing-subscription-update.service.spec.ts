import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { SubscriptionUpdateType } from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const MONTHLY_CREDIT_AMOUNTS = [
  5000000, 20000000, 50000000, 100000000, 200000000, 500000000, 1000000000,
  2000000000, 5000000000, 10000000000,
];

const YEARLY_CREDIT_AMOUNTS = [
  50000000, 240000000, 600000000, 1200000000, 2400000000, 6000000000,
  12000000000, 24000000000, 60000000000, 120000000000,
];

const buildCreditTier = (
  interval: SubscriptionInterval,
  creditAmount: number,
) =>
  ({
    stripePriceId: `price_credit_${interval}_${creditAmount}`,
    interval,
    active: true,
    metadata: { credit_amount: String(creditAmount) },
  }) as BillingPriceEntity;

const buildCreditProduct = () => {
  const billingPrices = [
    ...MONTHLY_CREDIT_AMOUNTS.map((creditAmount) =>
      buildCreditTier(SubscriptionInterval.Month, creditAmount),
    ),
    ...YEARLY_CREDIT_AMOUNTS.map((creditAmount) =>
      buildCreditTier(SubscriptionInterval.Year, creditAmount),
    ),
  ];

  const billingProduct = {
    stripeProductId: 'prod_credit',
    metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
    billingPrices,
  };

  billingPrices.forEach((billingPrice) => {
    Object.assign(billingPrice, { billingProduct });
  });

  return billingProduct;
};

const buildLicensedPrice = (interval: SubscriptionInterval) =>
  ({
    stripePriceId: `price_licensed_${interval}`,
    interval,
    active: true,
    metadata: {},
  }) as BillingPriceEntity;

const buildBaseProduct = () => {
  const billingPrices = [
    buildLicensedPrice(SubscriptionInterval.Month),
    buildLicensedPrice(SubscriptionInterval.Year),
  ];

  const billingProduct = {
    stripeProductId: 'prod_base',
    metadata: { productKey: BillingProductKey.BASE_PRODUCT },
    billingPrices,
  };

  billingPrices.forEach((billingPrice) => {
    Object.assign(billingPrice, { billingProduct });
  });

  return billingProduct;
};

describe('BillingSubscriptionUpdateService', () => {
  const buildService = async () => {
    const creditProduct = buildCreditProduct();
    const baseProduct = buildBaseProduct();
    const catalog = [
      ...baseProduct.billingPrices,
      ...creditProduct.billingPrices,
    ];

    const billingPriceRepository = {
      findOneOrFail: jest.fn(
        async ({ where }: { where: { stripePriceId: string } }) => {
          const billingPrice = catalog.find(
            ({ stripePriceId }) => stripePriceId === where.stripePriceId,
          );

          if (!billingPrice) {
            throw new Error(`Price ${where.stripePriceId} not found`);
          }

          return billingPrice;
        },
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingSubscriptionUpdateService,
        { provide: StripeSubscriptionService, useValue: {} },
        { provide: StripeInvoiceService, useValue: {} },
        { provide: BillingPriceService, useValue: {} },
        { provide: BillingProductService, useValue: {} },
        {
          provide: getRepositoryToken(BillingPriceEntity),
          useValue: billingPriceRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: {},
        },
        { provide: StripeSubscriptionScheduleService, useValue: {} },
        { provide: BillingSubscriptionPhaseService, useValue: {} },
        { provide: BillingSubscriptionService, useValue: {} },
        { provide: WorkspaceOrmManager, useValue: {} },
      ],
    }).compile();

    return module.get(BillingSubscriptionUpdateService);
  };

  describe('computeSubscriptionPricesUpdate on an interval switch', () => {
    it('moves a workspace to the yearly counterpart of its credit tier', async () => {
      const service = await buildService();

      expect(
        await service.computeSubscriptionPricesUpdate(
          {
            type: SubscriptionUpdateType.INTERVAL,
            newInterval: SubscriptionInterval.Year,
          },
          {
            licensedPriceId: 'price_licensed_month',
            seats: 3,
            resourceCreditPriceId: 'price_credit_month_5000000',
          },
        ),
      ).toEqual({
        licensedPriceId: 'price_licensed_year',
        seats: 3,
        resourceCreditPriceId: 'price_credit_year_50000000',
      });
    });

    it('moves a workspace back to the monthly counterpart of its credit tier', async () => {
      const service = await buildService();

      expect(
        await service.computeSubscriptionPricesUpdate(
          {
            type: SubscriptionUpdateType.INTERVAL,
            newInterval: SubscriptionInterval.Month,
          },
          {
            licensedPriceId: 'price_licensed_year',
            seats: 3,
            resourceCreditPriceId: 'price_credit_year_240000000',
          },
        ),
      ).toEqual({
        licensedPriceId: 'price_licensed_month',
        seats: 3,
        resourceCreditPriceId: 'price_credit_month_20000000',
      });
    });

    it('keeps the prices it was given when the interval does not change', async () => {
      const service = await buildService();

      const currentPrices = {
        licensedPriceId: 'price_licensed_month',
        seats: 3,
        resourceCreditPriceId: 'price_credit_month_20000000',
      };

      expect(
        await service.computeSubscriptionPricesUpdate(
          {
            type: SubscriptionUpdateType.INTERVAL,
            newInterval: SubscriptionInterval.Month,
          },
          currentPrices,
        ),
      ).toEqual(currentPrices);
    });
  });
});
