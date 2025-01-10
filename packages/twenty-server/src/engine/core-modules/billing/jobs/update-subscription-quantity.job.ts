import { Logger, Scope } from '@nestjs/common';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
export type UpdateSubscriptionQuantityJobData = { workspaceId: string };

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class UpdateSubscriptionQuantityJob {
  protected readonly logger = new Logger(UpdateSubscriptionQuantityJob.name);

  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @Process(UpdateSubscriptionQuantityJob.name)
  async handle(data: UpdateSubscriptionQuantityJobData): Promise<void> {
    const workspaceMemberRepository =
      await this.twentyORMManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
      );

    const workspaceMembersCount = await workspaceMemberRepository.count();

    if (!workspaceMembersCount || workspaceMembersCount <= 0) {
      return;
    }

    try {
      const billingSubscriptionItem =
        await this.billingSubscriptionService.getCurrentBillingSubscriptionItemOrThrow(
          data.workspaceId,
        );

      await this.stripeSubscriptionItemService.updateSubscriptionItem(
        billingSubscriptionItem.stripeSubscriptionItemId,
        workspaceMembersCount,
      );

      this.logger.log(
        `Updating workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members`,
      );
    } catch (e) {
      this.logger.warn(
        `Failed to update workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members. Error: ${e}`,
      );
    }
  }
}
