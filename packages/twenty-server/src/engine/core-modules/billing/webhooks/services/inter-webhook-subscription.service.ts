import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
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
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async processInterEvent(seuNumero: string, situacao: InterChargeStatus) {
    const workspace = await this.workspaceRepository.findOne({
      where: { interBillingChargeId: seuNumero },
      withDeleted: true,
    });

    if (!workspace) {
      this.logger.warn(
        `Workspace not found for interBillingChargeId: ${seuNumero}`,
      );

      return { noWorkspace: true };
    }

    if (!workspace.id) {
      throw new BillingException(
        'Workspace ID is required for subscription events',
        BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND,
      );
    }

    await this.billingCustomerRepository.upsert(
      {
        workspaceId: workspace.id,
        interBillingChargeId: seuNumero,
      },
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    // TODO: We also need to upsert subscriptionProduct items
    await this.billingSubscriptionRepository.upsert(
      {
        workspaceId: workspace.id,
        interBillingChargeId: seuNumero,
        status: interToSubscriptionStatusMap[situacao],
      },
      {
        conflictPaths: ['interBillingChargeId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

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
