import { Logger, Scope } from '@nestjs/common';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
export type UpdateSubscriptionJobData = { workspaceId: string };

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class UpdateSubscriptionJob {
  protected readonly logger = new Logger(UpdateSubscriptionJob.name);

  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly stripeService: StripeService,
  ) {}

  @Process(UpdateSubscriptionJob.name)
  async handle(data: UpdateSubscriptionJobData): Promise<void> {
    const workspaceMembersCount = await this.userWorkspaceService.getUserCount(
      data.workspaceId,
    );

    if (!workspaceMembersCount || workspaceMembersCount <= 0) {
      return;
    }

    try {
      const billingSubscriptionItem =
        await this.billingSubscriptionService.getCurrentBillingSubscriptionItemOrThrow(
          data.workspaceId,
        );

      await this.stripeService.updateSubscriptionItem(
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
