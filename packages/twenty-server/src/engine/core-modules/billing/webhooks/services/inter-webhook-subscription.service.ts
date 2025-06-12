import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addDays } from 'date-fns';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { ChargeStatus } from 'src/engine/core-modules/billing/enums/billing-charge.status.enum';
import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { interToSubscriptionStatusMap } from 'src/engine/core-modules/billing/webhooks/utils/inter-to-subsciption-status.mapper';
import { InterChargeStatus } from 'src/engine/core-modules/inter/enums/InterChargeStatus.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  CleanWorkspaceDeletionWarningUserVarsJob,
  CleanWorkspaceDeletionWarningUserVarsJobData,
} from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';

@Injectable()
export class InterWebhookSubscriptionService {
  protected readonly logger = new Logger(InterWebhookSubscriptionService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingCharge, 'core')
    private readonly billingChargeRepository: Repository<BillingCharge>,
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly billingPlanService: BillingPlanService,
  ) {}

  async processInterEvent(seuNumero: string, situacao: InterChargeStatus) {
    const billingCharge = await this.billingChargeRepository.findOneBy({
      chargeCode: seuNumero,
    });

    if (!billingCharge)
      throw new BillingException(
        `Billing charge not found`,
        BillingExceptionCode.BILLING_CHARGE_NOT_FOUND,
      );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: billingCharge.metadata.workspaceId },
      withDeleted: true,
    });

    if (!workspace) {
      this.logger.warn(
        `Workspace not found for interBillingChargeId: ${seuNumero}`,
      );

      return { noWorkspace: true };
    }

    const customer = await this.billingCustomerRepository.findOne({
      where: {
        workspaceId: workspace.id,
      },
    });

    if (situacao === InterChargeStatus.RECEBIDO)
      await this.billingChargeRepository.update(billingCharge.id, {
        status: ChargeStatus.PAID,
      });

    const now = new Date(Date.now());

    await this.billingSubscriptionRepository.upsert(
      {
        workspaceId: workspace.id,
        interBillingChargeId: seuNumero,
        status: interToSubscriptionStatusMap[situacao],
        provider: BillingPaymentProviders.Inter,
        interval: SubscriptionInterval.Month,
        stripeCustomerId: customer?.stripeCustomerId,
        currentPeriodStart: now,
        currentPeriodEnd: addDays(now, 30),
        currency: 'BRL',
        collectionMethod: BillingSubscriptionCollectionMethod.SEND_INVOICE,
        metadata: {
          workspaceId: workspace.id,
          plan: billingCharge.metadata.planKey,
        },
      },
      {
        conflictPaths: ['interBillingChargeId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const subscription = await this.billingSubscriptionRepository.findOne({
      where: {
        interBillingChargeId: seuNumero,
      },
    });

    if (!subscription)
      throw new BillingException(
        `Subscription not found`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );

    const billingPricesPerPlan = await this.billingPlanService.getPricesPerPlan(
      {
        planKey: billingCharge.metadata.planKey,
        interval: SubscriptionInterval.Month,
      },
    );

    const { baseProductPrice } = billingPricesPerPlan;

    await this.billingSubscriptionItemRepository.save({
      billingSubscriptionId: subscription.id,
      stripeProductId: baseProductPrice.stripeProductId,
      stripePriceId: baseProductPrice.stripePriceId,
      metadata: {
        trialPeriodFreeWorkflowCredits: 0,
      },
    });

    const billingSubscriptions = await this.billingSubscriptionRepository.find({
      where: { workspaceId: workspace.id },
    });

    const updatedBillingSubscription = billingSubscriptions.find(
      (subscription) => subscription.interBillingChargeId === seuNumero,
    );

    if (!updatedBillingSubscription) {
      throw new Error('Billing subscription not found');
    }

    if (
      this.shouldSuspendWorkspace(situacao) &&
      workspace.activationStatus === WorkspaceActivationStatus.ACTIVE
    ) {
      await this.workspaceRepository.update(workspace.id, {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      });
    }

    if (
      !this.shouldSuspendWorkspace(situacao) &&
      workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED
    ) {
      await this.workspaceRepository.update(workspace.id, {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });

      await this.messageQueueService.add<CleanWorkspaceDeletionWarningUserVarsJobData>(
        CleanWorkspaceDeletionWarningUserVarsJob.name,
        { workspaceId: workspace.id },
      );
    }

    return {
      interBillingChargeId: seuNumero,
    };
  }

  shouldSuspendWorkspace(situacao: InterChargeStatus): boolean {
    return ['ATRASADO', 'CANCELADO', 'EXPIRADO'].includes(situacao);
  }
}
