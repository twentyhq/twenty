import * as Sentry from '@sentry/node';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { getSubscriptionIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-subscription-id-from-invoice.util';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type SubscriptionWebhookEvent =
  | Stripe.CustomerSubscriptionUpdatedEvent
  | Stripe.CustomerSubscriptionCreatedEvent
  | Stripe.CustomerSubscriptionDeletedEvent;

type ActivationTransitionPayload = {
  eventName: 'billing.workspace_activation_transition';
  workspaceId: string;
  stripeEventId: string;
  stripeSubscriptionId: string;
  eventType: SubscriptionWebhookEvent['type'];
  subscriptionStatus: SubscriptionStatus;
  previousActivationStatus: WorkspaceActivationStatus;
  activationStatus: WorkspaceActivationStatus;
  observedAt: string;
};

const REACTIVATABLE_SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.Active,
  SubscriptionStatus.Trialing,
];

@Injectable()
export class BillingWebhookMonitoringService {
  private readonly logger = new Logger(BillingWebhookMonitoringService.name);

  constructor(
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getWorkspaceActivationStatus(
    workspaceId: string,
  ): Promise<WorkspaceActivationStatus | undefined> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      withDeleted: true,
    });

    return workspace?.activationStatus;
  }

  async recordSubscriptionEvent({
    workspaceId,
    event,
    previousActivationStatus,
  }: {
    workspaceId: string;
    event: SubscriptionWebhookEvent;
    previousActivationStatus?: WorkspaceActivationStatus;
  }): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      withDeleted: true,
    });

    if (!isDefined(workspace) || !isDefined(previousActivationStatus)) {
      return;
    }

    const subscriptionStatus = event.data.object.status as SubscriptionStatus;
    const activationStatus = workspace.activationStatus;

    if (activationStatus !== previousActivationStatus) {
      const payload: ActivationTransitionPayload = {
        eventName: 'billing.workspace_activation_transition',
        workspaceId,
        stripeEventId: event.id,
        stripeSubscriptionId: event.data.object.id,
        eventType: event.type,
        subscriptionStatus,
        previousActivationStatus,
        activationStatus,
        observedAt: new Date().toISOString(),
      };

      this.logActivationTransition(payload);
    }

    if (
      activationStatus === WorkspaceActivationStatus.SUSPENDED &&
      REACTIVATABLE_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)
    ) {
      this.captureSuspendedWorkspaceMismatch({
        workspaceId,
        stripeEventId: event.id,
        stripeSubscriptionId: event.data.object.id,
        eventType: event.type,
        subscriptionStatus,
        activationStatus,
      });
    }
  }

  async recordInvoicePaid(event: Stripe.InvoicePaidEvent): Promise<void> {
    const stripeCustomerId =
      typeof event.data.object.customer === 'string'
        ? event.data.object.customer
        : undefined;
    const stripeSubscriptionId = getSubscriptionIdFromInvoice(event.data.object);

    if (!isDefined(stripeCustomerId) || !isDefined(stripeSubscriptionId)) {
      return;
    }

    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId },
    });

    if (!isDefined(billingCustomer)) {
      return;
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: billingCustomer.workspaceId },
      withDeleted: true,
    });

    if (!isDefined(workspace)) {
      return;
    }

    const subscription = await this.billingSubscriptionRepository.findOne({
      where: { stripeSubscriptionId },
    });
    const subscriptionStatus = subscription?.status;
    const payload = {
      eventName: 'billing.invoice_paid',
      eventType: event.type,
      workspaceId: workspace.id,
      stripeEventId: event.id,
      stripeSubscriptionId,
      stripeCustomerId,
      subscriptionStatus,
      activationStatus: workspace.activationStatus,
      observedAt: new Date().toISOString(),
    };

    this.logger.log(JSON.stringify(payload));
    Sentry.addBreadcrumb({
      category: 'billing.invoice',
      level: 'info',
      message: 'Invoice paid webhook processed',
      data: payload,
    });

    if (
      workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED &&
      isDefined(subscriptionStatus) &&
      REACTIVATABLE_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)
    ) {
      this.captureSuspendedWorkspaceMismatch(payload);
    }
  }

  private logActivationTransition(
    payload: ActivationTransitionPayload,
  ): void {
    const message = JSON.stringify(payload);

    if (payload.activationStatus === WorkspaceActivationStatus.SUSPENDED) {
      this.logger.warn(message);
    } else {
      this.logger.log(message);
    }

    Sentry.addBreadcrumb({
      category: 'billing.workspace-activation',
      level:
        payload.activationStatus === WorkspaceActivationStatus.SUSPENDED
          ? 'warning'
          : 'info',
      message: 'Workspace activation status changed',
      data: payload,
    });
  }

  private captureSuspendedWorkspaceMismatch(
    payload: Record<string, unknown>,
  ): void {
    Sentry.withScope((scope) => {
      scope.setTag(
        'billingAlert',
        'suspended_workspace_with_paid_subscription',
      );
      scope.setFingerprint(['suspended_workspace_with_paid_subscription']);
      scope.setExtras(payload);
      Sentry.captureMessage(
        'Workspace is suspended while its Stripe subscription is active',
        'error',
      );
    });
  }
}
