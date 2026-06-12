import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { repoMock } from './utils/mock-builders.util';

jest.mock(
  'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-customer.util',
  () => ({
    transformStripeSubscriptionEventToDatabaseCustomer: jest.fn(() => ({
      workspaceId: 'workspace-id',
      stripeCustomerId: 'cus_123',
    })),
  }),
);

jest.mock(
  'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util',
  () => ({
    getSubscriptionStatus: jest.fn(),
    transformStripeSubscriptionEventToDatabaseSubscription: jest.fn(() => ({
      workspaceId: 'workspace-id',
      stripeSubscriptionId: 'stripe-sub-id',
    })),
  }),
);

import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util';

jest.mock(
  'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util',
  () => ({
    transformStripeSubscriptionEventToDatabaseSubscriptionItem: jest.fn(),
  }),
);

describe('BillingSubscriptionService', () => {
  let module: TestingModule;
  let service: BillingSubscriptionService;
  let billingSubscriptionRepository: jest.Mocked<
    Repository<BillingSubscriptionEntity>
  >;
  let billingSubscriptionItemRepository: jest.Mocked<
    Repository<BillingSubscriptionItemEntity>
  >;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BillingSubscriptionService,
        {
          provide: StripeSubscriptionService,
          useValue: {
            cancelSubscription: jest.fn(),
            collectLastInvoice: jest.fn(),
            updateSubscription: jest.fn(),
          },
        },
        {
          provide: BillingPriceService,
          useValue: {},
        },
        {
          provide: BillingPlanService,
          useValue: {
            getPlanBaseProduct: jest.fn(),
          },
        },
        {
          provide: StripeCustomerService,
          useValue: {
            hasPaymentMethod: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            getSubscriptionWithSchedule: jest.fn().mockResolvedValue({
              id: 'stripe-sub-id',
            }),
          },
        },
        {
          provide: EnterprisePlanService,
          useValue: {
            isValid: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingEntitlementEntity),
          useValue: repoMock<BillingEntitlementEntity>(),
        },
        {
          provide: getRepositoryToken(BillingSubscriptionEntity),
          useValue: repoMock<BillingSubscriptionEntity>(),
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItemEntity),
          useValue: repoMock<BillingSubscriptionItemEntity>(),
        },
        {
          provide: getRepositoryToken(BillingCustomerEntity),
          useValue: repoMock<BillingCustomerEntity>(),
        },
      ],
    }).compile();

    service = module.get(BillingSubscriptionService);
    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscriptionEntity),
    );
    billingSubscriptionItemRepository = module.get(
      getRepositoryToken(BillingSubscriptionItemEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete stale product items and upsert a deduplicated payload', async () => {
    billingSubscriptionRepository.find.mockResolvedValue([
      {
        id: 'db-sub-id',
        stripeSubscriptionId: 'stripe-sub-id',
      } as BillingSubscriptionEntity,
    ]);

    billingSubscriptionItemRepository.find.mockResolvedValue([
      {
        id: 'stale-item-id',
        billingSubscriptionId: 'db-sub-id',
        stripeProductId: 'prod-1',
        stripeSubscriptionItemId: 'si-stale',
      } as BillingSubscriptionItemEntity,
    ]);

    (
      transformStripeSubscriptionEventToDatabaseSubscriptionItem as jest.Mock
    ).mockReturnValue([
      {
        billingSubscriptionId: 'db-sub-id',
        stripeProductId: 'prod-1',
        stripeSubscriptionItemId: 'si-first',
      },
      {
        billingSubscriptionId: 'db-sub-id',
        stripeProductId: 'prod-1',
        stripeSubscriptionItemId: 'si-second',
      },
    ]);

    await service.syncSubscriptionToDatabase('workspace-id', 'stripe-sub-id');

    expect(billingSubscriptionItemRepository.delete).toHaveBeenCalledTimes(1);
    expect(billingSubscriptionItemRepository.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          stripeProductId: 'prod-1',
          stripeSubscriptionItemId: 'si-second',
        }),
      ],
      {
        conflictPaths: ['stripeSubscriptionItemId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  });
});
