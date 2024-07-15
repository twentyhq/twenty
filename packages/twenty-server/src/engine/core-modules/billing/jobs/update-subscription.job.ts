import { Logger, Scope } from '@nestjs/common';

import { BillingWorkspaceService } from 'src/engine/core-modules/billing/billing.workspace-service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
export type UpdateSubscriptionJobData = { workspaceId: string };

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class UpdateSubscriptionJob {
  protected readonly logger = new Logger(UpdateSubscriptionJob.name);

  constructor(
    private readonly billingWorkspaceService: BillingWorkspaceService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly stripeService: StripeService,
  ) {}

  @Process(UpdateSubscriptionJob.name)
  async handle(data: UpdateSubscriptionJobData): Promise<void> {
    const workspaceMembersCount =
      await this.userWorkspaceService.getWorkspaceMemberCount();

    if (!workspaceMembersCount || workspaceMembersCount <= 0) {
      return;
    }

    try {
      const billingSubscriptionItem =
        await this.billingWorkspaceService.getBillingSubscriptionItem(
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
