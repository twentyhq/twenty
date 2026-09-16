import { useBillingUpdateMutation } from '@/settings/billing/hooks/useBillingUpdateMutation';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
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
  const { isMutationRunning, runBillingUpdateMutation } =
    useBillingUpdateMutation();

  const [switchBillingPlanMutation] = useMutation(SwitchBillingPlanDocument);

  const getTargetPlanLabel = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

  const getSuccessMessage = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ||
    subscriptionStatus === SubscriptionStatus.Trialing
      ? t`Subscription has been switched to ${getTargetPlanLabel(targetPlanKey)} Plan.`
      : t`Subscription will be switched to ${getTargetPlanLabel(targetPlanKey)} Plan the ${getBeautifiedRenewDate()}.`;

  const switchBillingPlan = async (targetPlanKey: BillingPlanKey) =>
    await runBillingUpdateMutation({
      errorMessage: t`Error while switching subscription.`,
      mutate: async () =>
        (await switchBillingPlanMutation()).data?.switchBillingPlan,
      successMessage: getSuccessMessage(targetPlanKey),
    });

  return {
    isSwitchingPlan: isMutationRunning,
    switchBillingPlan,
  };
};
