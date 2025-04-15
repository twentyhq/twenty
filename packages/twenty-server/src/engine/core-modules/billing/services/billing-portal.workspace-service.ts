/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { StripeBillingPortalService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-portal.service';
import { StripeCheckoutService } from 'src/engine/core-modules/billing/stripe/services/stripe-checkout.service';
import { BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import { BillingPortalCheckoutSessionParameters } from 'src/engine/core-modules/billing/types/billing-portal-checkout-session-parameters.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { assert } from 'src/utils/assert';

@Injectable()
export class BillingPortalWorkspaceService {
  protected readonly logger = new Logger(BillingPortalWorkspaceService.name);
  constructor(
    private readonly stripeCheckoutService: StripeCheckoutService,
    private readonly stripeBillingPortalService: StripeBillingPortalService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async computeCheckoutSessionURL({
    user,
    workspace,
    billingPricesPerPlan,
    successUrlPath,
    plan,
    requirePaymentMethod,
  }: BillingPortalCheckoutSessionParameters): Promise<string> {
    const frontBaseUrl = this.domainManagerService.buildWorkspaceURL({
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

    const customer = await this.billingCustomerRepository.findOne({
      where: { workspaceId: workspace.id },
      relations: ['billingSubscriptions'],
    });

    const stripeSubscriptionLineItems = this.getStripeSubscriptionLineItems({
      quantity,
      billingPricesPerPlan,
    });

    const checkoutSession =
      await this.stripeCheckoutService.createCheckoutSession({
        user,
        workspaceId: workspace.id,
        stripeSubscriptionLineItems,
        successUrl,
        cancelUrl,
        stripeCustomerId: customer?.stripeCustomerId,
        plan,
        requirePaymentMethod,
        withTrialPeriod:
          !isDefined(customer) || customer.billingSubscriptions.length === 0,
      });

    assert(checkoutSession.url, 'Error: missing checkout.session.url');

    return checkoutSession.url;
  }

  async computeBillingPortalSessionURLOrThrow(
    workspace: Workspace,
    returnUrlPath?: string,
  ) {
    const lastSubscription = await this.billingSubscriptionRepository.findOne({
      where: { workspaceId: workspace.id },
      order: { createdAt: 'DESC' },
    });

    if (!lastSubscription) {
      throw new Error('Error: missing subscription');
    }

    const stripeCustomerId = lastSubscription.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new Error('Error: missing stripeCustomerId');
    }

    const frontBaseUrl = this.domainManagerService.buildWorkspaceURL({
      workspace,
    });

    if (returnUrlPath) {
      frontBaseUrl.pathname = returnUrlPath;
    }
    const returnUrl = frontBaseUrl.toString();

    const session =
      await this.stripeBillingPortalService.createBillingPortalSession(
        stripeCustomerId,
        returnUrl,
      );

    assert(session.url, 'Error: missing billingPortal.session.url');

    return session.url;
  }

  private getStripeSubscriptionLineItems({
    quantity,
    billingPricesPerPlan,
  }: {
    quantity: number;
    billingPricesPerPlan?: BillingGetPricesPerPlanResult;
  }): Stripe.Checkout.SessionCreateParams.LineItem[] {
    if (billingPricesPerPlan) {
      return [
        {
          price: billingPricesPerPlan.baseProductPrice.stripePriceId,
          quantity,
        },
        ...billingPricesPerPlan.meteredProductsPrices.map((price) => ({
          price: price.stripePriceId,
        })),
      ];
    }

    throw new BillingException(
      'Missing Billing prices per plan',
      BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
    );
  }
}
