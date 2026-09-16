import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useRunBillingUpdate } from '@/settings/billing/hooks/useRunBillingUpdate';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import {
  BillingPlanKey,
  SubscriptionStatus,
  SwitchBillingPlanDocument,
} from '~/generated-metadata/graphql';

export const useSwitchBillingPlan = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const { getBeautifiedRenewDate } = useBillingWording();

  const [switchBillingPlanMutation] = useMutation(SwitchBillingPlanDocument);

  const { isBillingUpdateRunning, runBillingUpdate } = useRunBillingUpdate({
    mutate: async () =>
      (await switchBillingPlanMutation()).data?.switchBillingPlan,
  });

  const getTargetPlanLabel = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

  const getSuccessMessage = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ||
    subscriptionStatus === SubscriptionStatus.Trialing
      ? t`Subscription has been switched to ${getTargetPlanLabel(targetPlanKey)} Plan.`
      : t`Subscription will be switched to ${getTargetPlanLabel(targetPlanKey)} Plan the ${getBeautifiedRenewDate()}.`;

  const switchBillingPlan = async (targetPlanKey: BillingPlanKey) =>
    await runBillingUpdate({
      getErrorMessage: () => t`Error while switching subscription.`,
      getSuccessMessage: () => getSuccessMessage(targetPlanKey),
    });

  return {
    isSwitchingPlan: isBillingUpdateRunning,
    switchBillingPlan,
  };
};
