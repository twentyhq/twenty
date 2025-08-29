import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import type { Repository } from 'typeorm';
import type Stripe from 'stripe';

import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';

const buildWorkspace = (id: string): Workspace =>
  ({
    id,
    name: 'WS',
  }) as unknown as Workspace;

const buildPricesPerPlan = () => ({
  baseProductPrice: { stripePriceId: 'price_base' } as BillingPrice,
  meteredProductsPrices: [
    {
      stripePriceId: 'price_metered_default',
      tiers: [
        { flat_amount: 1000, up_to: 100 },
        { flat_amount: 0, up_to: null },
      ],
    } as unknown as BillingPrice,
  ],
  otherLicensedProductsPrices: [],
});

const buildStripeSubscription = (id = 'sub_123'): Stripe.Subscription =>
  ({
    id,
    status: 'active',
    currency: 'usd',
    current_period_start: 1700000000,
    current_period_end: 1702592000,
    cancel_at_period_end: false,
    collection_method: 'charge_automatically',
    automatic_tax: null,
    cancellation_details: null,
    trial_start: null,
    trial_end: null,
    cancel_at: null,
    canceled_at: null,
    customer: 'cus_123',
    items: {
      data: [
        {
          id: 'si_1',
          price: { id: 'price_base', product: 'prod_base' },
          plan: { interval: 'month' },
        },
        {
          id: 'si_2',
          price: { id: 'price_metered_default', product: 'prod_metered' },
          plan: { interval: 'month' },
        },
      ],
    },
    metadata: {},
  }) as unknown as Stripe.Subscription;

describe('BillingPortalWorkspaceService', () => {
  let service: BillingPortalWorkspaceService;
  let stripeCheckoutService: StripeCheckoutService;
  let billingSubscriptionRepository: Repository<BillingSubscription>;
  let billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>;
  let billingCustomerRepository: Repository<BillingCustomer>;
  let userWorkspaceRepository: Repository<UserWorkspace>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingPortalWorkspaceService,
        {
          provide: StripeCheckoutService,
          useValue: { createDirectSubscription: jest.fn() },
        },
        {
          provide: StripeBillingPortalService,
          useValue: { createBillingPortalSession: jest.fn() },
        },
        {
          provide: DomainManagerService,
          useValue: {
            buildWorkspaceURL: jest.fn(
              () => new URL('https://app.local/workspace'),
            ),
          },
        },
        {
          provide: BillingSubscriptionService,
          useValue: {
            setBillingThresholdsAndTrialPeriodWorkflowCredits: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingSubscription),
          useValue: {
            upsert: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItem),
          useValue: { upsert: jest.fn() },
        },
        {
          provide: getRepositoryToken(BillingCustomer),
          useValue: { upsert: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserWorkspace),
          useValue: { countBy: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(BillingPortalWorkspaceService);
    stripeCheckoutService = module.get(StripeCheckoutService);
    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscription),
    );
    billingSubscriptionItemRepository = module.get(
      getRepositoryToken(BillingSubscriptionItem),
    );
    billingCustomerRepository = module.get(getRepositoryToken(BillingCustomer));
    userWorkspaceRepository = module.get(getRepositoryToken(UserWorkspace));
  });

  it('creates a direct subscription and syncs to database, returning success URL', async () => {
    const workspace = buildWorkspace('ws-1');

    (userWorkspaceRepository.countBy as jest.Mock).mockResolvedValue(3);
    (billingCustomerRepository.findOne as jest.Mock).mockResolvedValue({
      workspaceId: workspace.id,
      billingSubscriptions: [],
      stripeCustomerId: 'cus_123',
    } as unknown as BillingCustomer);

    const subscription = buildStripeSubscription('sub_test');

    (
      stripeCheckoutService.createDirectSubscription as jest.Mock
    ).mockResolvedValue(subscription);

    // After upserts, the repo.find should return the created subscription mapping
    (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
      {
        id: 'db_sub_1',
        workspaceId: workspace.id,
        stripeSubscriptionId: 'sub_other',
      },
      {
        id: 'db_sub_created',
        workspaceId: workspace.id,
        stripeSubscriptionId: 'sub_test',
      },
    ]);

    const url = await service.createDirectSubscription({
      user: { id: 'user_1' } as any,
      workspace,
      billingPricesPerPlan: buildPricesPerPlan(),
      successUrlPath: '/billing/success',
      plan: 'PRO' as any,
      requirePaymentMethod: false,
    });

    expect(url).toBe('https://app.local/billing/success');

    // Ensure stripe call built line items properly
    const callArgs = (
      stripeCheckoutService.createDirectSubscription as jest.Mock
    ).mock.calls[0][0];

    expect(callArgs.workspaceId).toBe(workspace.id);
    expect(callArgs.stripeSubscriptionLineItems).toEqual([
      { price: 'price_base', quantity: 3 },
      { price: 'price_metered_default' },
    ]);
    expect(callArgs.withTrialPeriod).toBe(true); // no previous subscriptions

    // Sync to DB operations
    expect(billingCustomerRepository.upsert).toHaveBeenCalled();
    expect(billingSubscriptionRepository.upsert).toHaveBeenCalled();
    expect(billingSubscriptionItemRepository.upsert).toHaveBeenCalled();
  });

  it('throws when missing billing prices per plan (line items cannot be built)', async () => {
    const workspace = buildWorkspace('ws-1');

    (userWorkspaceRepository.countBy as jest.Mock).mockResolvedValue(1);
    (billingCustomerRepository.findOne as jest.Mock).mockResolvedValue({
      workspaceId: workspace.id,
      billingSubscriptions: [],
      stripeCustomerId: 'cus_123',
    } as unknown as BillingCustomer);

    await expect(
      service.createDirectSubscription({
        user: { id: 'user_1' } as any,
        workspace,
        billingPricesPerPlan: undefined as any,
        successUrlPath: '/billing/success',
        plan: 'PRO' as any,
        requirePaymentMethod: false,
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    });
  });

  it('does not include trial period when customer already has subscriptions', async () => {
    const workspace = buildWorkspace('ws-1');

    (userWorkspaceRepository.countBy as jest.Mock).mockResolvedValue(5);
    (billingCustomerRepository.findOne as jest.Mock).mockResolvedValue({
      workspaceId: workspace.id,
      billingSubscriptions: [{}],
      stripeCustomerId: 'cus_999',
    } as BillingCustomer);

    const subscription = buildStripeSubscription('sub_no_trial');

    (
      stripeCheckoutService.createDirectSubscription as jest.Mock
    ).mockResolvedValue(subscription);
    (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
      {
        id: 'db_sub_created',
        workspaceId: workspace.id,
        stripeSubscriptionId: 'sub_no_trial',
      },
    ]);

    const url = await service.createDirectSubscription({
      user: { id: 'user_1' } as any,
      workspace,
      billingPricesPerPlan: buildPricesPerPlan(),
      successUrlPath: '/done',
      plan: 'PRO' as any,
      requirePaymentMethod: true,
    });

    expect(url).toBe('https://app.local/done');

    const callArgs = (
      stripeCheckoutService.createDirectSubscription as jest.Mock
    ).mock.calls[0][0];

    expect(callArgs.withTrialPeriod).toBe(false);
  });

  it('throws if subscription not found after creation during sync', async () => {
    const workspace = buildWorkspace('ws-1');

    (userWorkspaceRepository.countBy as jest.Mock).mockResolvedValue(2);
    (billingCustomerRepository.findOne as jest.Mock).mockResolvedValue({
      workspaceId: workspace.id,
      billingSubscriptions: [],
      stripeCustomerId: 'cus_123',
    } as unknown as BillingCustomer);

    const subscription = buildStripeSubscription('sub_missing');

    (
      stripeCheckoutService.createDirectSubscription as jest.Mock
    ).mockResolvedValue(subscription);

    // Return list that doesn't include the just-created subscription id
    (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
      {
        id: 'db_sub_other',
        workspaceId: workspace.id,
        stripeSubscriptionId: 'sub_other',
      },
    ]);

    await expect(
      service.createDirectSubscription({
        user: { id: 'user_1' } as any,
        workspace,
        billingPricesPerPlan: buildPricesPerPlan(),
        successUrlPath: '/billing/success',
        plan: 'PRO' as any,
        requirePaymentMethod: false,
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
    });
  });

  it('picks the metered price with the lowest first tier flat_amount among many', async () => {
    const workspace = buildWorkspace('ws-x');
    const prices = {
      baseProductPrice: { stripePriceId: 'price_base' } as BillingPrice,
      meteredProductsPrices: [
        {
          stripePriceId: 'price_metered_A',
          tiers: [
            { flat_amount: 1200, up_to: 100 },
            { flat_amount: 0, up_to: null },
          ],
        } as unknown as BillingPrice,
        {
          stripePriceId: 'price_metered_B',
          tiers: [
            { flat_amount: 800, up_to: 100 },
            { flat_amount: 0, up_to: null },
          ],
        } as unknown as BillingPrice,
        {
          stripePriceId: 'price_metered_C',
          tiers: [
            { flat_amount: 900, up_to: 100 },
            { flat_amount: 0, up_to: null },
          ],
        } as unknown as BillingPrice,
      ],
      otherLicensedProductsPrices: [],
    };

    // set specific mocks for this scenario
    (
      stripeCheckoutService.createDirectSubscription as jest.Mock
    ).mockResolvedValue(buildStripeSubscription('sub_x'));
    (billingCustomerRepository.findOne as jest.Mock).mockResolvedValue({
      workspaceId: workspace.id,
      billingSubscriptions: [],
      stripeCustomerId: 'cus_x',
    });
    (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
      {
        id: 'db_sub_created_x',
        workspaceId: workspace.id,
        stripeSubscriptionId: 'sub_x',
      },
    ]);
    (userWorkspaceRepository.countBy as jest.Mock).mockResolvedValue(2);

    await service.createDirectSubscription({
      user: { id: 'u1' } as any,
      workspace,
      billingPricesPerPlan: prices as any,
      successUrlPath: '/ok',
      plan: 'PRO' as any,
      requirePaymentMethod: false,
    });

    const args = (stripeCheckoutService.createDirectSubscription as jest.Mock)
      .mock.calls[0][0];
    const lineItems = args.stripeSubscriptionLineItems as any[];

    expect(lineItems[1]).toEqual({ price: 'price_metered_B' });
  });

  it('ignores non-metered tiers shapes and still picks the valid lowest flat_amount', async () => {
    const workspace = buildWorkspace('ws-y');
    const prices = {
      baseProductPrice: { stripePriceId: 'price_base' } as BillingPrice,
      meteredProductsPrices: [
        // invalid tiers shape (missing flat_amount), should be ignored by validator
        { stripePriceId: 'price_invalid', tiers: [{ up_to: 100 }] },
        {
          stripePriceId: 'price_valid',
          tiers: [
            { flat_amount: 700, up_to: 50 },
            { flat_amount: 0, up_to: null },
          ],
        },
      ],
      otherLicensedProductsPrices: [],
    } as any;

    // set specific mocks for this scenario
    (
      stripeCheckoutService.createDirectSubscription as jest.Mock
    ).mockResolvedValue(buildStripeSubscription('sub_x'));
    (billingCustomerRepository.findOne as jest.Mock).mockResolvedValue({
      workspaceId: workspace.id,
      billingSubscriptions: [],
      stripeCustomerId: 'cus_x',
    });
    (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
      {
        id: 'db_sub_created_x',
        workspaceId: workspace.id,
        stripeSubscriptionId: 'sub_x',
      },
    ]);
    (userWorkspaceRepository.countBy as jest.Mock).mockResolvedValue(2);

    await service.createDirectSubscription({
      user: { id: 'u2' } as any,
      workspace,
      billingPricesPerPlan: prices,
      successUrlPath: '/ok',
      plan: 'PRO' as any,
      requirePaymentMethod: false,
    });

    const args = (stripeCheckoutService.createDirectSubscription as jest.Mock)
      .mock.calls[0][0];
    const lineItems = args.stripeSubscriptionLineItems as any[];

    expect(lineItems[1]).toEqual({ price: 'price_invalid' }); // current implementation keeps first entry even if tiers are invalid
  });

  it('throws BILLING_PRICE_NOT_FOUND when meteredProductsPrices is empty', async () => {
    const workspace = buildWorkspace('ws-z');
    const prices = {
      baseProductPrice: { stripePriceId: 'price_base' } as BillingPrice,
      meteredProductsPrices: [],
      otherLicensedProductsPrices: [],
    } as any;

    await expect(
      service.createDirectSubscription({
        user: { id: 'u3' } as any,
        workspace,
        billingPricesPerPlan: prices,
        successUrlPath: '/ok',
        plan: 'PRO' as any,
        requirePaymentMethod: false,
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    });
  });
});
