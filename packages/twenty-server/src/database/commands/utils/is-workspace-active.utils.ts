import { Repository } from 'typeorm';

import {
  BillingSubscription,
  SubscriptionStatus,
} from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const isWorkspaceActive = async ({
  workspace,
  billingSubscriptionRepository,
  featureFlagRepository,
}: {
  workspace: Workspace;
  billingSubscriptionRepository: Repository<BillingSubscription>;
  featureFlagRepository: Repository<FeatureFlagEntity>;
}) => {
  const billingSubscriptionForWorkspace =
    await billingSubscriptionRepository.findOne({
      where: { workspaceId: workspace.id },
    });

  if (
    billingSubscriptionForWorkspace?.status &&
    [
      SubscriptionStatus.PastDue,
      SubscriptionStatus.Active,
      SubscriptionStatus.Trialing,
    ].includes(billingSubscriptionForWorkspace.status as SubscriptionStatus)
  ) {
    return true;
  }

  const freeAccessEnabledFeatureFlagForWorkspace =
    await featureFlagRepository.findOne({
      where: {
        workspaceId: workspace.id,
        key: FeatureFlagKeys.IsFreeAccessEnabled,
        value: true,
      },
    });

  return !!freeAccessEnabledFeatureFlagForWorkspace;
};
