import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { assert } from 'src/utils/assert';

@Injectable()
export class BillingPortalWorkspaceService {
  protected readonly logger = new Logger(BillingPortalWorkspaceService.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async computeCheckoutSessionURL(
    user: User,
    workspace: Workspace,
    priceId: string,
    successUrlPath?: string,
  ): Promise<string> {
    const frontBaseUrl = this.domainManagerService.getBaseUrl();
    const cancelUrl = frontBaseUrl.toString();

    if (successUrlPath) {
      frontBaseUrl.pathname = successUrlPath;
    }
    const successUrl = frontBaseUrl.toString();

    const quantity = await this.userWorkspaceRepository.countBy({
      workspaceId: workspace.id,
    });

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
      cancelUrl,
      stripeCustomerId,
    );

    assert(session.url, 'Error: missing checkout.session.url');

    return session.url;
  }

  async computeBillingPortalSessionURLOrThrow(
    workspaceId: string,
    returnUrlPath?: string,
  ) {
    const currentSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        {
          workspaceId,
        },
      );

    if (!currentSubscription) {
      throw new Error('Error: missing subscription');
    }

    const stripeCustomerId = currentSubscription.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new Error('Error: missing stripeCustomerId');
    }

    const frontBaseUrl = this.domainManagerService.getBaseUrl();

    if (returnUrlPath) {
      frontBaseUrl.pathname = returnUrlPath;
    }
    const returnUrl = frontBaseUrl.toString();

    const session = await this.stripeService.createBillingPortalSession(
      stripeCustomerId,
      returnUrl,
    );

    assert(session.url, 'Error: missing billingPortal.session.url');

    return session.url;
  }
}
