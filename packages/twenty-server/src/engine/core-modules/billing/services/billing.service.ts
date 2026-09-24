/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { REGISTER_PAYMENT_METHOD_DOMAIN_JOB_RETRY_LIMIT } from 'src/engine/core-modules/billing/constants/register-payment-method-domain-job-retry-limit.constant';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import {
  RegisterPaymentMethodDomainJob,
  type RegisterPaymentMethodDomainJobData,
} from 'src/engine/core-modules/billing/jobs/register-payment-method-domain.job';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { getPaymentMethodDomainName } from 'src/engine/core-modules/billing/utils/get-payment-method-domain-name.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { type WorkspaceDomainConfig } from 'src/engine/core-modules/domain/workspace-domains/types/workspace-domain-config.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingProductService: BillingProductService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  isBillingEnabled() {
    return this.twentyConfigService.get('IS_BILLING_ENABLED');
  }

  async ensureBillingCustomer({
    userEmail,
    workspaceId,
    workspaceDisplayName,
  }: {
    userEmail: string;
    workspaceId: string;
    workspaceDisplayName: string | undefined;
  }): Promise<void> {
    const existingBillingCustomer =
      await this.billingCustomerRepository.findOne(workspaceId, { where: {} });

    if (isDefined(existingBillingCustomer)) {
      return;
    }

    await this.stripeCustomerService.createStripeCustomer(
      userEmail,
      workspaceId,
      workspaceDisplayName,
    );
  }

  // Stripe only shows Apple Pay, Google Pay and the Link button on registered
  // domains, and each workspace subdomain has to be registered on its own.
  // Callers have already committed the workspace, so a failure here must not
  // reach them.
  async registerPaymentMethodDomain(
    workspace: WorkspaceDomainConfig,
  ): Promise<void> {
    if (!this.isBillingEnabled()) {
      return;
    }

    try {
      const domainName = getPaymentMethodDomainName(
        this.workspaceDomainsService.getWorkspaceUrls(workspace).subdomainUrl,
      );

      if (!isDefined(domainName)) {
        return;
      }

      await this.messageQueueService.add<RegisterPaymentMethodDomainJobData>(
        RegisterPaymentMethodDomainJob.name,
        { domainName },
        { retryLimit: REGISTER_PAYMENT_METHOD_DOMAIN_JOB_RETRY_LIMIT },
      );
    } catch (error) {
      this.logger.error(
        `Could not queue payment method domain registration for subdomain ${workspace.subdomain}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  async hasWorkspaceAnySubscription(workspaceId: string) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    const subscription = await this.billingSubscriptionRepository.findOne(
      workspaceId,
      { where: {} },
    );

    return isDefined(subscription);
  }

  async hasEntitlement(
    workspaceId: string,
    entitlementKey: BillingEntitlementKey,
  ) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    return this.billingSubscriptionService.getWorkspaceEntitlementByKey(
      workspaceId,
      entitlementKey,
    );
  }

  async isPayingCustomer(workspaceId: string) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    return (
      currentBillingSubscription !== NO_BILLING_SUBSCRIPTION &&
      currentBillingSubscription.status === SubscriptionStatus.Active
    );
  }

  async isSubscriptionIncompleteOnboardingStatus(workspaceId: string) {
    const hasAnySubscription =
      await this.hasWorkspaceAnySubscription(workspaceId);

    return !hasAnySubscription;
  }
}
