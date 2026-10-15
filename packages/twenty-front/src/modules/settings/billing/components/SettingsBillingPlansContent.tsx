import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingPlansWithSubscription } from '@/settings/billing/components/internal/SettingsBillingPlansWithSubscription';
import { SettingsBillingPlansWithoutSubscription } from '@/settings/billing/components/internal/SettingsBillingPlansWithoutSubscription';
import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/SettingsBillingPlanComparison';
import { getComparedBillingPlanKeysOrThrow } from '@/settings/billing/utils/getComparedBillingPlanKeysOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { SubscriptionInterval } from '~/generated-metadata/graphql';

export const SettingsBillingPlansContent = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { formatPrices: planPrices } = useFormatPrices();
  const { listPlans } = usePlans();
  const [billingInterval, setBillingInterval] =
    useState<SettingsBillingPlanInterval>(SubscriptionInterval.Year);

  const currentPlanKey = getSubscriptionPlanKey(
    currentWorkspace?.currentBillingSubscription,
  );

  const comparedPlanKeys = getComparedBillingPlanKeysOrThrow(listPlans());

  if (
    !isDefined(currentPlanKey) ||
    !isDefined(currentWorkspace?.currentBillingSubscription)
  ) {
    return (
      <SettingsBillingPlansWithoutSubscription
        billingInterval={billingInterval}
        comparedPlanKeys={comparedPlanKeys}
        onBillingIntervalChange={setBillingInterval}
        planPrices={planPrices}
      />
    );
  }

  return (
    <SettingsBillingPlansWithSubscription
      billingInterval={billingInterval}
      comparedPlanKeys={comparedPlanKeys}
      currentPlanKey={currentPlanKey}
      onBillingIntervalChange={setBillingInterval}
      planPrices={planPrices}
    />
  );
};
