/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('BillingService', () => {
  let service: BillingService;
  let stripeCustomerService: jest.Mocked<
    Pick<StripeCustomerService, 'createStripeCustomer'>
  >;
  let billingCustomerRepository: jest.Mocked<{ findOne: jest.Mock }>;

  const ensureParams = {
    userEmail: 'user@example.com',
    workspaceId: 'ws_123',
    workspaceDisplayName: 'Acme',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: BillingSubscriptionService,
          useValue: {},
        },
        {
          provide: BillingProductService,
          useValue: {},
        },
        {
          provide: StripeCustomerService,
          useValue: {
            createStripeCustomer: jest
              .fn()
              .mockResolvedValue({ id: 'cus_123' }),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    stripeCustomerService = module.get(StripeCustomerService);
    billingCustomerRepository = module.get(
      getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureBillingCustomer', () => {
    it('creates a stripe customer when none exists', async () => {
      billingCustomerRepository.findOne.mockResolvedValue(null);

      await service.ensureBillingCustomer(ensureParams);

      expect(stripeCustomerService.createStripeCustomer).toHaveBeenCalledWith(
        'user@example.com',
        'ws_123',
        'Acme',
      );
    });

    it('is idempotent when a billing customer already exists', async () => {
      billingCustomerRepository.findOne.mockResolvedValue({ id: 'bc_1' });

      await service.ensureBillingCustomer(ensureParams);

      expect(stripeCustomerService.createStripeCustomer).not.toHaveBeenCalled();
    });
  });
});
