import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { BillingService } from 'src/engine/core-modules/billing/billing.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
export type UpdateSubscriptionJobData = { workspaceId: string };
@Injectable()
export class UpdateSubscriptionJob
  implements MessageQueueJob<UpdateSubscriptionJobData>
{
  protected readonly logger = new Logger(UpdateSubscriptionJob.name);
  constructor(
    private readonly billingService: BillingService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly stripeService: StripeService,
  ) {}

  async handle(data: UpdateSubscriptionJobData): Promise<void> {
    const workspaceMembersCount =
      await this.userWorkspaceService.getWorkspaceMemberCount(data.workspaceId);

    if (workspaceMembersCount <= 0) {
      return;
    }

    try {
      const billingSubscriptionItem =
        await this.billingService.getBillingSubscriptionItem(data.workspaceId);

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
