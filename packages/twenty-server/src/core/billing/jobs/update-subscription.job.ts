import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { BillingService } from 'src/core/billing/billing.service';
import { UserWorkspaceService } from 'src/core/user-workspace/user-workspace.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { StripeService } from 'src/core/billing/stripe/stripe.service';
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
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async handle(data: UpdateSubscriptionJobData): Promise<void> {
    const isSelfBillingEnabled = await this.featureFlagRepository.findOneBy({
      workspaceId: data.workspaceId,
      key: FeatureFlagKeys.IsSelfBillingEnabled,
      value: true,
    });

    if (!isSelfBillingEnabled) {
      return;
    }

    const workspaceMembersCount =
      await this.userWorkspaceService.getWorkspaceMemberCount(data.workspaceId);

    if (workspaceMembersCount <= 0) {
      return;
    }

    const billingSubscriptionItem =
      await this.billingService.getBillingSubscriptionItem(data.workspaceId);

    await this.stripeService.updateSubscriptionItem(
      billingSubscriptionItem.stripeSubscriptionItemId,
      workspaceMembersCount,
    );

    this.logger.log(
      `Updating workspace ${data.workspaceId} subscription quantity to ${workspaceMembersCount} members`,
    );
  }
}
