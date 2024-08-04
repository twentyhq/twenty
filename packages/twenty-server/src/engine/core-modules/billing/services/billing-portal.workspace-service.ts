import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { assert } from 'src/utils/assert';

export enum WebhookEvent {
  CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  SETUP_INTENT_SUCCEEDED = 'setup_intent.succeeded',
}

@Injectable()
export class BillingPortalWorkspaceService {
  protected readonly logger = new Logger(BillingPortalWorkspaceService.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async computeCheckoutSessionURL(
    user: User,
    workspace: Workspace,
    priceId: string,
    successUrlPath?: string,
  ): Promise<string> {
    const frontBaseUrl = this.environmentService.get('FRONT_BASE_URL');
    const successUrl = successUrlPath
      ? frontBaseUrl + successUrlPath
      : frontBaseUrl;

    const quantity =
      (await this.userWorkspaceService.getUserCount(workspace.id)) || 1;

    const stripeCustomerId = (
      await this.billingSubscriptionRepository.findOneBy({
        workspaceId: user.defaultWorkspaceId,
      })
    )?.stripeCustomerId;

    const session = await this.stripeService.createCheckoutSession(
      user,
      priceId,
      quantity,
      successUrl,
      frontBaseUrl,
      stripeCustomerId,
    );

    assert(session.url, 'Error: missing checkout.session.url');

    return session.url;
  }

  async computeBillingPortalSessionURL(
    workspaceId: string,
    returnUrlPath?: string,
  ) {
    const currentSubscriptionItem =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        {
          workspaceId,
        },
      );

    const stripeCustomerId = currentSubscriptionItem.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new Error('Error: missing stripeCustomerId');
    }

    const frontBaseUrl = this.environmentService.get('FRONT_BASE_URL');
    const returnUrl = returnUrlPath
      ? frontBaseUrl + returnUrlPath
      : frontBaseUrl;

    const session = await this.stripeService.createBillingPortalSession(
      stripeCustomerId,
      returnUrl,
    );

    assert(session.url, 'Error: missing billingPortal.session.url');

    return session.url;
  }
}
