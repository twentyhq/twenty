/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  assertIsDefinedOrThrow,
  findOrThrow,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Not, Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { type BillingPortalCheckoutSessionParameters } from 'src/engine/core-modules/billing/types/billing-portal-checkout-session-parameters.type';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class BillingPortalWorkspaceService {
  protected readonly logger = new Logger(BillingPortalWorkspaceService.name);
  constructor(
    private readonly stripeCheckoutService: StripeCheckoutService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly stripeBillingPortalService: StripeBillingPortalService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async computeCheckoutSessionURL({
    user,
    workspace,
    billingPricesPerPlan,
    successUrlPath,
    plan,
    requirePaymentMethod,
    couponCode,
  }: BillingPortalCheckoutSessionParameters): Promise<string> {
    const { successUrl, cancelUrl, customer, stripeSubscriptionLineItems } =
      await this.prepareSubscriptionParameters({
        workspace,
        billingPricesPerPlan,
        successUrlPath,
      });

    const checkoutSession =
      await this.stripeCheckoutService.createCheckoutSession({
        user,
        workspace,
        stripeSubscriptionLineItems,
        successUrl,
        cancelUrl,
        stripeCustomerId: customer?.stripeCustomerId,
        plan,
        requirePaymentMethod,
        withTrialPeriod: this.isCustomerEligibleForTrialPeriod(customer),
        couponCode,
      });

    assertIsDefinedOrThrow(
      checkoutSession.url,
      new BillingException(
        'Error: missing checkout.session.url',
        BillingExceptionCode.BILLING_STRIPE_ERROR,
      ),
    );

    return checkoutSession.url;
  }

  async createDirectSubscription({
    user,
    workspace,
    billingPricesPerPlan,
    successUrlPath,
    plan,
    requirePaymentMethod,
    couponCode,
  }: BillingPortalCheckoutSessionParameters): Promise<string> {
    const { successUrl, customer, stripeSubscriptionLineItems } =
      await this.prepareSubscriptionParameters({
        workspace,
        billingPricesPerPlan,
        successUrlPath,
      });

    if (
      isNonEmptyArray(customer?.billingSubscriptions) &&
      customer.billingSubscriptions.some(
        (subscription) => subscription.status !== SubscriptionStatus.Canceled,
      )
    ) {
      throw new BillingException(
        'Customer already has a non-canceled billing subscription',
        BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID,
      );
    }

    const stripeSubscription =
      await this.stripeCheckoutService.createDirectSubscription({
        user,
        workspace,
        stripeSubscriptionLineItems,
        stripeCustomerId: customer?.stripeCustomerId,
        plan,
        requirePaymentMethod,
        withTrialPeriod: this.isCustomerEligibleForTrialPeriod(customer),
        couponCode,
      });

    await this.billingSubscriptionService.syncSubscriptionToDatabase(
      workspace.id,
      stripeSubscription.id,
    );

    return successUrl;
  }

  async createSubscriptionPaymentIntent({
    user,
    workspace,
    billingPricesPerPlan,
    plan,
    idempotencyKey,
    couponCode,
  }: BillingPortalCheckoutSessionParameters & {
    idempotencyKey: string;
  }): Promise<{
    clientSecret: string;
    paymentIntentType: string;
  }> {
    const { customer, stripeSubscriptionLineItems } =
      await this.prepareSubscriptionParameters({
        workspace,
        billingPricesPerPlan,
      });

    const resumablePaymentIntent =
      await this.findResumableSubscriptionPaymentIntent(customer);

    if (isDefined(resumablePaymentIntent)) {
      return resumablePaymentIntent;
    }

    const stripeSubscription =
      await this.stripeCheckoutService.createSubscriptionWithPaymentMethodCollection(
        {
          user,
          workspace,
          stripeSubscriptionLineItems,
          stripeCustomerId: customer?.stripeCustomerId,
          plan,
          withTrialPeriod: this.isCustomerEligibleForTrialPeriod(customer),
          idempotencyKey,
          couponCode,
        },
      );

    await this.billingSubscriptionService.syncSubscriptionToDatabase(
      workspace.id,
      stripeSubscription.id,
    );

    const paymentIntent =
      this.extractSubscriptionClientSecret(stripeSubscription);

    return paymentIntent;
  }

  async createPaymentMethodSetupIntent(
    workspace: WorkspaceEntity,
  ): Promise<{ clientSecret: string; paymentIntentType: string }> {
    const subscription = await this.billingSubscriptionRepository.findOne(
      workspace.id,
      {
        where: { status: Not(SubscriptionStatus.Canceled) },
        order: { createdAt: 'DESC' },
      },
    );

    const stripeCustomerId = subscription?.stripeCustomerId;

    if (!isDefined(stripeCustomerId)) {
      throw new BillingException(
        'Error: missing subscription for payment method setup intent',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    const setupIntent =
      await this.stripeCustomerService.createSetupIntent(stripeCustomerId);

    assertIsDefinedOrThrow(
      setupIntent.client_secret,
      new BillingException(
        'Error: missing setupIntent.client_secret',
        BillingExceptionCode.BILLING_STRIPE_ERROR,
      ),
    );

    return {
      clientSecret: setupIntent.client_secret,
      paymentIntentType: 'setup',
    };
  }

  // A failed earlier attempt leaves an incomplete subscription; it must not
  // count, or a retry would be charged immediately instead of getting the
  // trial. Only a real (non-incomplete) subscription blocks a new trial.
  private isCustomerEligibleForTrialPeriod(
    customer: BillingCustomerEntity | null,
  ): boolean {
    return (
      !isDefined(customer) ||
      !customer.billingSubscriptions.some(
        (subscription) =>
          subscription.status !== SubscriptionStatus.Incomplete &&
          subscription.status !== SubscriptionStatus.IncompleteExpired,
      )
    );
  }

  private async findResumableSubscriptionPaymentIntent(
    customer: BillingCustomerEntity | null,
  ): Promise<{ clientSecret: string; paymentIntentType: string } | null> {
    const existingSubscription = customer?.billingSubscriptions?.find(
      (subscription) => subscription.status !== SubscriptionStatus.Canceled,
    );

    if (!isDefined(existingSubscription)) {
      return null;
    }

    const stripeSubscription =
      await this.stripeCheckoutService.retrieveSubscriptionForResume(
        existingSubscription.stripeSubscriptionId,
      );

    const paymentIntent = this.findSubscriptionClientSecret(stripeSubscription);

    if (isDefined(paymentIntent)) {
      return paymentIntent;
    }

    if (
      stripeSubscription.status === 'incomplete' ||
      stripeSubscription.status === 'incomplete_expired'
    ) {
      return null;
    }

    throw new BillingException(
      'Customer already has a non-canceled billing subscription',
      BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID,
    );
  }

  private extractSubscriptionClientSecret(subscription: Stripe.Subscription): {
    clientSecret: string;
    paymentIntentType: string;
  } {
    const paymentIntent = this.findSubscriptionClientSecret(subscription);

    if (!isDefined(paymentIntent)) {
      throw new BillingException(
        'Error: missing subscription client secret',
        BillingExceptionCode.BILLING_STRIPE_ERROR,
      );
    }

    return paymentIntent;
  }

  private findSubscriptionClientSecret(subscription: Stripe.Subscription): {
    clientSecret: string;
    paymentIntentType: string;
  } | null {
    const pendingSetupIntent = subscription.pending_setup_intent;

    if (
      isDefined(pendingSetupIntent) &&
      typeof pendingSetupIntent !== 'string' &&
      isDefined(pendingSetupIntent.client_secret)
    ) {
      return {
        clientSecret: pendingSetupIntent.client_secret,
        paymentIntentType: 'setup',
      };
    }

    const latestInvoice = subscription.latest_invoice;
    const confirmationSecret =
      isDefined(latestInvoice) && typeof latestInvoice !== 'string'
        ? latestInvoice.confirmation_secret
        : undefined;

    if (
      isDefined(confirmationSecret) &&
      isDefined(confirmationSecret.client_secret)
    ) {
      return {
        clientSecret: confirmationSecret.client_secret,
        paymentIntentType: 'payment',
      };
    }

    return null;
  }

  private async prepareSubscriptionParameters({
    workspace,
    billingPricesPerPlan,
    successUrlPath,
  }: {
    workspace: WorkspaceEntity;
    billingPricesPerPlan: BillingGetPricesPerPlanResult;
    successUrlPath?: string;
  }) {
    const frontBaseUrl = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
    });
    const cancelUrl = frontBaseUrl.toString();

    if (successUrlPath) {
      frontBaseUrl.pathname = successUrlPath;
    }
    const successUrl = frontBaseUrl.toString();

    const quantity = await this.userWorkspaceRepository.countBy({
      workspaceId: workspace.id,
    });

    const customer = await this.billingCustomerRepository.findOne(
      workspace.id,
      {
        where: {},
        relations: ['billingSubscriptions'],
      },
    );

    const stripeSubscriptionLineItems = this.getStripeSubscriptionLineItems({
      quantity,
      billingPricesPerPlan,
      workspaceId: workspace.id,
    });

    return {
      successUrl,
      cancelUrl,
      quantity,
      customer,
      stripeSubscriptionLineItems,
    };
  }

  async computeBillingPortalSessionURLOrThrow(
    workspace: WorkspaceEntity,
    returnUrlPath?: string,
    forPaymentMethodUpdate?: boolean,
  ) {
    const lastSubscription = await this.billingSubscriptionRepository.findOne(
      workspace.id,
      {
        where: { status: Not(SubscriptionStatus.Canceled) },
        order: { createdAt: 'DESC' },
      },
    );

    if (!lastSubscription) {
      throw new Error('Error: missing subscription');
    }

    const stripeCustomerId = lastSubscription.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new Error('Error: missing stripeCustomerId');
    }

    const returnUrl = this.buildReturnUrl(workspace, returnUrlPath);

    const session = forPaymentMethodUpdate
      ? await this.stripeBillingPortalService.createBillingPortalSessionForPaymentMethodUpdate(
          stripeCustomerId,
          returnUrl,
        )
      : await this.stripeBillingPortalService.createBillingPortalSession(
          stripeCustomerId,
          returnUrl,
        );

    assertIsDefinedOrThrow(
      session.url,
      new BillingException(
        'Error: missing billingPortal.session.url',
        BillingExceptionCode.BILLING_STRIPE_ERROR,
      ),
    );

    return session.url;
  }

  async computeBillingPortalSessionURLForPaymentMethodUpdate(
    workspace: WorkspaceEntity,
    stripeCustomerId: string,
    returnUrlPath?: string,
  ) {
    const returnUrl = this.buildReturnUrl(workspace, returnUrlPath);

    const session =
      await this.stripeBillingPortalService.createBillingPortalSessionForPaymentMethodUpdate(
        stripeCustomerId,
        returnUrl,
      );

    assertIsDefinedOrThrow(
      session.url,
      new BillingException(
        'Error: missing billingPortal.session.url',
        BillingExceptionCode.BILLING_STRIPE_ERROR,
      ),
    );

    return session.url;
  }

  private buildReturnUrl(workspace: WorkspaceEntity, returnUrlPath?: string) {
    const frontBaseUrl = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
    });

    if (!isDefined(returnUrlPath)) {
      return frontBaseUrl.toString();
    }

    const resolvedUrl = new URL(returnUrlPath, frontBaseUrl);

    if (resolvedUrl.origin !== frontBaseUrl.origin) {
      return frontBaseUrl.toString();
    }

    return resolvedUrl.toString();
  }

  private getDefaultResourceCreditPrice(
    billingPricesPerPlan: BillingGetPricesPerPlanResult,
  ) {
    const resourceCreditPrices =
      billingPricesPerPlan.resourceCreditProductPrices;

    if (!isDefined(resourceCreditPrices) || resourceCreditPrices.length === 0) {
      throw new BillingException(
        'Missing Default RESOURCE_CREDIT price',
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    return resourceCreditPrices.reduce((lowest, price) => {
      const amount = Number(price.metadata?.credit_amount ?? 0);
      const lowestAmount = Number(lowest.metadata?.credit_amount ?? 0);

      return amount < lowestAmount ? price : lowest;
    });
  }

  private getStripeSubscriptionLineItems({
    quantity,
    billingPricesPerPlan,
  }: {
    quantity: number;
    billingPricesPerPlan: BillingGetPricesPerPlanResult;
    workspaceId: string;
  }): Stripe.Checkout.SessionCreateParams.LineItem[] {
    const defaultBaseProductPrice = findOrThrow(
      billingPricesPerPlan.baseProductPrices,
      (baseProductPrice) =>
        baseProductPrice.billingProduct?.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT,
      new BillingException(
        `Base product not found`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      ),
    );

    const defaultResourceCreditPrice =
      this.getDefaultResourceCreditPrice(billingPricesPerPlan);

    return [
      {
        price: defaultBaseProductPrice.stripePriceId,
        quantity,
      },
      {
        price: defaultResourceCreditPrice.stripePriceId,
        quantity: 1,
      },
    ];
  }
}
