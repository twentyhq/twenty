/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { SubscriptionUpdateType } from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { StripeInvoiceService } from 'src/engine/core-modules/billing/stripe/services/stripe-invoice.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

type FixtureProduct = {
  active: true;
  stripeProductId: string;
  metadata: { productKey: BillingProductKey; planKey: BillingPlanKey };
  billingPrices: BillingPriceEntity[];
};

const baseProduct: FixtureProduct = {
  active: true,
  stripeProductId: 'prod_base',
  metadata: {
    productKey: BillingProductKey.BASE_PRODUCT,
    planKey: BillingPlanKey.PRO,
  },
  billingPrices: [],
};

const resourceCreditProduct: FixtureProduct = {
  active: true,
  stripeProductId: 'prod_credits',
  metadata: {
    productKey: BillingProductKey.RESOURCE_CREDIT,
    planKey: BillingPlanKey.PRO,
  },
  billingPrices: [],
};

const buildPrice = ({
  stripePriceId,
  interval,
  product,
  creditAmount,
}: {
  stripePriceId: string;
  interval: SubscriptionInterval;
  product: FixtureProduct;
  creditAmount?: number;
}) =>
  ({
    stripePriceId,
    interval,
    active: true,
    metadata: creditAmount ? { credit_amount: String(creditAmount) } : {},
    billingProduct: product,
  }) as unknown as BillingPriceEntity;

const baseProductMonth = buildPrice({
  stripePriceId: 'price_base_month',
  interval: SubscriptionInterval.Month,
  product: baseProduct,
});
const baseProductYear = buildPrice({
  stripePriceId: 'price_base_year',
  interval: SubscriptionInterval.Year,
  product: baseProduct,
});

const creditMonthPackages = [50, 100, 200].map((creditAmount) =>
  buildPrice({
    stripePriceId: `price_credits_month_${creditAmount}`,
    interval: SubscriptionInterval.Month,
    product: resourceCreditProduct,
    creditAmount,
  }),
);
const creditYearPackages = [600, 1200, 2400].map((creditAmount) =>
  buildPrice({
    stripePriceId: `price_credits_year_${creditAmount}`,
    interval: SubscriptionInterval.Year,
    product: resourceCreditProduct,
    creditAmount,
  }),
);

const allPrices = [
  baseProductMonth,
  baseProductYear,
  ...creditMonthPackages,
  ...creditYearPackages,
];

baseProduct.billingPrices.push(baseProductMonth, baseProductYear);
resourceCreditProduct.billingPrices.push(
  ...creditMonthPackages,
  ...creditYearPackages,
);

describe('BillingSubscriptionUpdateService interval switch', () => {
  let service: BillingSubscriptionUpdateService;

  const billingPriceRepository = {
    findOneOrFail: jest.fn(
      ({ where }: { where: { stripePriceId: string } }) => {
        const price = allPrices.find(
          (candidate) => candidate.stripePriceId === where.stripePriceId,
        );

        if (!price) throw new Error(`no fixture for ${where.stripePriceId}`);

        return Promise.resolve(price);
      },
    ),
  };

  const billingProductService = {
    getProductPrices: jest.fn(
      ({ interval }: { interval: SubscriptionInterval }) =>
        Promise.resolve(
          allPrices.filter((price) => price.interval === interval),
        ),
    ),
  };

  const noop = {};

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingSubscriptionUpdateService,
        {
          provide: BillingPriceService,
          useValue: new BillingPriceService(
            noop as never,
            billingPriceRepository as never,
            billingProductService as never,
          ),
        },
        { provide: BillingProductService, useValue: billingProductService },
        {
          provide: getRepositoryToken(BillingPriceEntity),
          useValue: billingPriceRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: noop,
        },
        { provide: StripeSubscriptionService, useValue: noop },
        { provide: StripeInvoiceService, useValue: noop },
        { provide: StripeSubscriptionScheduleService, useValue: noop },
        { provide: BillingSubscriptionService, useValue: noop },
        { provide: WorkspaceOrmManager, useValue: noop },
      ],
    }).compile();

    service = module.get<BillingSubscriptionUpdateService>(
      BillingSubscriptionUpdateService,
    );
  });

  it('moves a monthly package to the yearly package worth twelve months of it', async () => {
    const result = await service.computeSubscriptionPricesUpdate(
      {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Year,
      },
      {
        baseProductPriceId: 'price_base_month',
        resourceCreditPriceId: 'price_credits_month_100',
        seats: 3,
      } as never,
    );

    expect(result.resourceCreditPriceId).toBe('price_credits_year_1200');
    expect(result.baseProductPriceId).toBe('price_base_year');
  });

  it('moves a yearly package back to the monthly package worth a twelfth of it', async () => {
    const result = await service.computeSubscriptionPricesUpdate(
      {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Month,
      },
      {
        baseProductPriceId: 'price_base_year',
        resourceCreditPriceId: 'price_credits_year_1200',
        seats: 3,
      } as never,
    );

    expect(result.resourceCreditPriceId).toBe('price_credits_month_100');
    expect(result.baseProductPriceId).toBe('price_base_month');
  });

  it('switches interval on a product holding several packages at that interval', async () => {
    expect(
      resourceCreditProduct.billingPrices.filter(
        (price) => price.interval === SubscriptionInterval.Year,
      ),
    ).toHaveLength(3);

    await expect(
      service.computeSubscriptionPricesUpdate(
        {
          type: SubscriptionUpdateType.INTERVAL,
          newInterval: SubscriptionInterval.Year,
        },
        {
          baseProductPriceId: 'price_base_month',
          resourceCreditPriceId: 'price_credits_month_100',
          seats: 1,
        } as never,
      ),
    ).resolves.toBeDefined();
  });

  it('leaves the prices untouched when the interval already matches', async () => {
    const currentPrices = {
      baseProductPriceId: 'price_base_month',
      resourceCreditPriceId: 'price_credits_month_100',
      seats: 2,
    };

    const result = await service.computeSubscriptionPricesUpdate(
      {
        type: SubscriptionUpdateType.INTERVAL,
        newInterval: SubscriptionInterval.Month,
      },
      currentPrices as never,
    );

    expect(result).toEqual(currentPrices);
  });
});

describe('BillingSubscriptionUpdateService seat update against a stale mirror', () => {
  let service: BillingSubscriptionUpdateService;

  const stripeSubscriptionService = { updateSubscription: jest.fn() };
  const stripeSubscriptionScheduleService = {
    loadSubscriptionSchedule: jest.fn(),
  };
  const billingSubscriptionService = { syncSubscriptionToDatabase: jest.fn() };
  const billingSubscriptionRepository = { findOneOrFail: jest.fn() };
  const billingPriceRepository = {
    find: jest.fn(
      ({ where }: { where: { stripePriceId: { value: string[] } } }) =>
        Promise.resolve(
          allPrices.filter((price) =>
            where.stripePriceId.value.includes(price.stripePriceId),
          ),
        ),
    ),
  };

  const noop = {};

  const mockSeats = ({
    databaseSeats,
    stripeSeats,
  }: {
    databaseSeats: number;
    stripeSeats: number;
  }) => {
    billingSubscriptionRepository.findOneOrFail.mockResolvedValue({
      id: 'subscription_id',
      workspaceId: 'workspace_id',
      stripeSubscriptionId: 'sub_stripe',
      status: SubscriptionStatus.Active,
      billingSubscriptionItems: [
        {
          stripeSubscriptionItemId: 'si_base',
          stripePriceId: 'price_base_month',
          quantity: databaseSeats,
          billingProduct: baseProduct,
        },
        {
          stripeSubscriptionItemId: 'si_credits',
          stripePriceId: 'price_credits_month_100',
          quantity: 1,
          billingProduct: resourceCreditProduct,
        },
      ],
    });

    stripeSubscriptionScheduleService.loadSubscriptionSchedule.mockResolvedValue(
      {
        subscription: {
          items: {
            data: [
              { price: { id: 'price_base_month' }, quantity: stripeSeats },
              { price: { id: 'price_credits_month_100' }, quantity: 1 },
            ],
          },
        },
      },
    );
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingSubscriptionUpdateService,
        { provide: BillingPriceService, useValue: noop },
        { provide: BillingProductService, useValue: noop },
        {
          provide: getRepositoryToken(BillingPriceEntity),
          useValue: billingPriceRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: billingSubscriptionRepository,
        },
        {
          provide: StripeSubscriptionService,
          useValue: stripeSubscriptionService,
        },
        { provide: StripeInvoiceService, useValue: noop },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: stripeSubscriptionScheduleService,
        },
        {
          provide: BillingSubscriptionService,
          useValue: billingSubscriptionService,
        },
        { provide: WorkspaceOrmManager, useValue: noop },
      ],
    }).compile();

    service = module.get<BillingSubscriptionUpdateService>(
      BillingSubscriptionUpdateService,
    );
  });

  it('pushes the requested seats when the database already holds them but Stripe does not', async () => {
    mockSeats({ databaseSeats: 5, stripeSeats: 6 });

    await service.updateSubscription('workspace_id', 'subscription_id', {
      type: SubscriptionUpdateType.SEATS,
      newSeats: 5,
    });

    expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
      'sub_stripe',
      expect.objectContaining({
        items: expect.arrayContaining([
          { id: 'si_base', price: 'price_base_month', quantity: 5 },
        ]),
        proration_behavior: 'create_prorations',
      }),
    );
  });

  it('sends nothing when Stripe already holds the requested seats', async () => {
    mockSeats({ databaseSeats: 6, stripeSeats: 5 });

    await service.updateSubscription('workspace_id', 'subscription_id', {
      type: SubscriptionUpdateType.SEATS,
      newSeats: 5,
    });

    expect(stripeSubscriptionService.updateSubscription).not.toHaveBeenCalled();
  });
});
