/* @license Enterprise */

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('BillingPortalWorkspaceService', () => {
  let service: BillingPortalWorkspaceService;
  let stripeCheckoutService: jest.Mocked<StripeCheckoutService>;
  let billingSubscriptionService: jest.Mocked<BillingSubscriptionService>;
  let billingCustomerRepository: { findOne: jest.Mock };

  const workspace = { id: 'workspace-id' } as WorkspaceEntity;
  const user = { id: 'user-id' } as never;

  const billingPricesPerPlan = {
    meteredProductPrices: [],
    baseProductPrices: [
      {
        stripePriceId: 'price-base',
        billingProduct: {
          metadata: { productKey: BillingProductKey.BASE_PRODUCT },
        },
      },
    ],
    resourceCreditProductPrices: [
      {
        stripePriceId: 'price-credit',
        metadata: { credit_amount: '100' },
      },
    ],
  } as unknown as BillingGetPricesPerPlanResult;

  const buildCustomer = (statuses: SubscriptionStatus[]) =>
    ({
      stripeCustomerId: 'stripe-customer-id',
      billingSubscriptions: statuses.map((status, index) => ({
        id: `subscription-${index}`,
        stripeSubscriptionId: `stripe-subscription-${index}`,
        status,
      })),
    }) as unknown as BillingCustomerEntity;

  const callCreateDirectSubscription = () =>
    service.createDirectSubscription({
      user,
      workspace,
      billingPricesPerPlan,
      successUrlPath: '/success',
      plan: BillingPlanKey.PRO,
      requirePaymentMethod: false,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingPortalWorkspaceService,
        {
          provide: StripeCheckoutService,
          useValue: {
            createCheckoutSession: jest.fn(),
            createDirectSubscription: jest.fn().mockResolvedValue({
              id: 'new-stripe-subscription-id',
            }),
            createSubscriptionWithPaymentMethodCollection: jest.fn(),
            retrieveSubscriptionForResume: jest.fn(),
          },
        },
        {
          provide: StripeCustomerService,
          useValue: { createSetupIntent: jest.fn() },
        },
        {
          provide: StripeBillingPortalService,
          useValue: { createBillingPortalSession: jest.fn() },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: jest.fn(
              () => new URL('https://acme.twenty.com/'),
            ),
          },
        },
        {
          provide: BillingSubscriptionService,
          useValue: { syncSubscriptionToDatabase: jest.fn() },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: { countBy: jest.fn().mockResolvedValue(3) },
        },
      ],
    }).compile();

    service = module.get(BillingPortalWorkspaceService);
    stripeCheckoutService = module.get(StripeCheckoutService);
    billingSubscriptionService = module.get(BillingSubscriptionService);
    billingCustomerRepository = module.get(
      getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDirectSubscription', () => {
    it.each([
      SubscriptionStatus.Active,
      SubscriptionStatus.Trialing,
      SubscriptionStatus.PastDue,
      SubscriptionStatus.Unpaid,
      SubscriptionStatus.Paused,
    ])(
      'should return the success url without creating a subscription when customer already has a %s subscription',
      async (status) => {
        billingCustomerRepository.findOne.mockResolvedValue(
          buildCustomer([status]),
        );

        const result = await callCreateDirectSubscription();

        expect(result).toBe('https://acme.twenty.com/success');
        expect(
          stripeCheckoutService.createDirectSubscription,
        ).not.toHaveBeenCalled();
        expect(
          billingSubscriptionService.syncSubscriptionToDatabase,
        ).not.toHaveBeenCalled();
      },
    );

    it.each([
      SubscriptionStatus.Incomplete,
      SubscriptionStatus.IncompleteExpired,
    ])(
      'should throw when customer only has an %s subscription',
      async (status) => {
        billingCustomerRepository.findOne.mockResolvedValue(
          buildCustomer([status]),
        );

        await expect(callCreateDirectSubscription()).rejects.toThrow(
          new BillingException(
            'Customer already has a non-canceled billing subscription',
            BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID,
          ),
        );
        expect(
          stripeCheckoutService.createDirectSubscription,
        ).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['no customer', null, undefined, true],
      ['no subscription', buildCustomer([]), 'stripe-customer-id', true],
      [
        'only canceled subscriptions',
        buildCustomer([SubscriptionStatus.Canceled]),
        'stripe-customer-id',
        false,
      ],
    ])(
      'should create the subscription and return the success url when customer has %s',
      async (
        _,
        customer,
        expectedStripeCustomerId,
        expectedWithTrialPeriod,
      ) => {
        billingCustomerRepository.findOne.mockResolvedValue(customer);

        const result = await callCreateDirectSubscription();

        expect(result).toBe('https://acme.twenty.com/success');
        expect(
          stripeCheckoutService.createDirectSubscription,
        ).toHaveBeenCalledWith({
          user,
          workspace,
          stripeSubscriptionLineItems: [
            { price: 'price-base', quantity: 3 },
            { price: 'price-credit', quantity: 1 },
          ],
          stripeCustomerId: expectedStripeCustomerId,
          plan: BillingPlanKey.PRO,
          requirePaymentMethod: false,
          withTrialPeriod: expectedWithTrialPeriod,
        });
        expect(
          billingSubscriptionService.syncSubscriptionToDatabase,
        ).toHaveBeenCalledWith('workspace-id', 'new-stripe-subscription-id');
      },
    );
  });
});
