import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingPlansWithSubscription } from '@/settings/billing/components/internal/SettingsBillingPlansWithSubscription';
import { SettingsBillingPlansWithoutSubscription } from '@/settings/billing/components/internal/SettingsBillingPlansWithoutSubscription';
import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const parseCurrentPlanKey = (plan: unknown): BillingPlanKey | undefined => {
  if (plan === BillingPlanKey.PRO || plan === BillingPlanKey.ENTERPRISE) {
    return plan;
  }

  return undefined;
};

export const SettingsBillingPlansContent = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { formatPrices: planPrices } = useFormatPrices();
  const [billingInterval, setBillingInterval] =
    useState<SettingsBillingPlanInterval>(SubscriptionInterval.Year);

  const currentPlanKey = parseCurrentPlanKey(
    currentWorkspace?.currentBillingSubscription?.metadata?.['plan'],
  );

  if (
    !isDefined(currentPlanKey) ||
    !isDefined(currentWorkspace?.currentBillingSubscription)
  ) {
    return (
      <SettingsBillingPlansWithoutSubscription
        billingInterval={billingInterval}
        onBillingIntervalChange={setBillingInterval}
        planPrices={planPrices}
      />
    );
  }

  return (
    <SettingsBillingPlansWithSubscription
      billingInterval={billingInterval}
      currentPlanKey={currentPlanKey}
      onBillingIntervalChange={setBillingInterval}
      planPrices={planPrices}
    />
  );
};
