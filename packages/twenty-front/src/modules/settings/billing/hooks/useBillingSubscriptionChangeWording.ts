import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import { useNextInterval } from '@/settings/billing/hooks/useNextInterval';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';
import { type BillingSubscriptionChangeWording } from '@/settings/billing/types/billingSubscriptionChangeWording.type';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

type ChargeTiming = 'CURRENT' | 'NOW' | 'AFTER_TRIAL' | 'SCHEDULED';

export const useBillingSubscriptionChangeWording = () => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace?.currentBillingSubscription);

  const currentInterval = currentWorkspace.currentBillingSubscription.interval;

  assertIsDefinedOrThrow(currentInterval);

  const { currentPlan } = useCurrentPlan();
  const currentPlanKey = currentPlan.planKey;
  const { nextPlan } = useNextPlan();
  const { nextInterval } = useNextInterval();
  const upcomingPlanKey = nextPlan?.planKey ?? currentPlanKey;
  const upcomingInterval = nextInterval ?? currentInterval;
  const isPlanSwitchScheduled = upcomingPlanKey !== currentPlanKey;
  const isIntervalSwitchScheduled = upcomingInterval !== currentInterval;
  const isTrialing = useSubscriptionStatus() === SubscriptionStatus.Trialing;
  const { formatPrices } = useFormatPrices();
  const { getBeautifiedRenewDate } = useBillingWording();

  const getPlanLabel = (planKey: BillingPlanKey) =>
    planKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

  const getIntervalAdjective = (interval: SubscriptionInterval) =>
    interval === SubscriptionInterval.Year ? t`annual` : t`monthly`;

  const getChargeSentence = (
    planKey: BillingPlanKey,
    interval: SubscriptionInterval,
    timing: ChargeTiming,
  ) => {
    const price = formatNumber(formatPrices[planKey][interval]);
    const billedSuffix =
      interval === SubscriptionInterval.Year ? t`, billed annually` : '';

    switch (timing) {
      case 'CURRENT':
        return t`You are charged $${price} per user per month${billedSuffix}.`;
      case 'NOW':
        return t`You will be charged $${price} per user per month${billedSuffix}.`;
      case 'AFTER_TRIAL':
        return t`When your trial ends, you will be charged $${price} per user per month${billedSuffix}.`;
      case 'SCHEDULED':
        return t`From ${getBeautifiedRenewDate()}, you will be charged $${price} per user per month${billedSuffix}.`;
    }
  };

  const getSwitchPlanWording = (
    targetPlanKey: BillingPlanKey,
    selectedInterval: SettingsBillingPlanInterval | undefined,
  ): BillingSubscriptionChangeWording => {
    const isUpgrade = targetPlanKey === BillingPlanKey.ENTERPRISE;
    const planLabel = getPlanLabel(targetPlanKey);
    const lead = isTrialing
      ? t`Your plan switches to ${planLabel} immediately and your trial continues.`
      : isUpgrade
        ? t`Your plan switches to Organization immediately, with a prorated charge for the rest of your current billing period.`
        : t`Your plan switches to Pro on ${getBeautifiedRenewDate()}, at the end of your current billing period.`;
    const charge = getChargeSentence(
      targetPlanKey,
      upcomingInterval,
      isTrialing ? 'AFTER_TRIAL' : isUpgrade ? 'NOW' : 'SCHEDULED',
    );
    const upcomingIntervalAdjective = getIntervalAdjective(upcomingInterval);
    const stepNote =
      isDefined(selectedInterval) && selectedInterval !== upcomingInterval
        ? t`Billing stays ${upcomingIntervalAdjective}. To switch to ${getIntervalAdjective(selectedInterval)} billing, confirm this change first, then switch the billing interval as a second step.`
        : undefined;

    return {
      title: isUpgrade ? t`Upgrade to Organization?` : t`Switch to Pro?`,
      subtitle: [lead, charge, stepNote].filter(isDefined).join(' '),
    };
  };

  const getSwitchIntervalWording = (
    targetInterval: SettingsBillingPlanInterval,
  ): BillingSubscriptionChangeWording => {
    const isUpgrade = targetInterval === SubscriptionInterval.Year;
    const intervalAdjective = getIntervalAdjective(targetInterval);
    const lead = isTrialing
      ? t`Your billing switches to ${intervalAdjective} immediately and your trial continues.`
      : isUpgrade
        ? t`Your billing switches to annual immediately. A new annual period starts today and the unused part of your current period is credited.`
        : t`Your billing switches to monthly on ${getBeautifiedRenewDate()}, at the end of your current billing period.`;
    const charge = getChargeSentence(
      upcomingPlanKey,
      targetInterval,
      isTrialing ? 'AFTER_TRIAL' : isUpgrade ? 'NOW' : 'SCHEDULED',
    );

    return {
      title: isUpgrade
        ? t`Upgrade to annual billing?`
        : t`Switch to monthly billing?`,
      subtitle: `${lead} ${charge}`,
    };
  };

  const getCancelPlanSwitchWording = (): BillingSubscriptionChangeWording => {
    const upcomingPlanLabel = getPlanLabel(upcomingPlanKey);
    const currentPlanLabel = getPlanLabel(currentPlanKey);
    const upcomingIntervalAdjective = getIntervalAdjective(upcomingInterval);
    const keptSwitch = isIntervalSwitchScheduled
      ? t`Your scheduled switch to ${upcomingIntervalAdjective} billing on ${getBeautifiedRenewDate()} is kept.`
      : undefined;

    return {
      title: t`Cancel plan switching?`,
      subtitle: [
        t`This cancels the scheduled switch to ${upcomingPlanLabel} on ${getBeautifiedRenewDate()}.`,
        t`You stay on the ${currentPlanLabel} plan.`,
        getChargeSentence(currentPlanKey, currentInterval, 'CURRENT'),
        keptSwitch,
      ]
        .filter(isDefined)
        .join(' '),
    };
  };

  const getCancelIntervalSwitchWording =
    (): BillingSubscriptionChangeWording => {
      const upcomingIntervalAdjective = getIntervalAdjective(upcomingInterval);
      const currentIntervalAdjective = getIntervalAdjective(currentInterval);
      const currentPlanLabel = getPlanLabel(currentPlanKey);
      const upcomingPlanLabel = getPlanLabel(upcomingPlanKey);
      const keptSwitch = isPlanSwitchScheduled
        ? t`Your scheduled switch to ${upcomingPlanLabel} on ${getBeautifiedRenewDate()} is kept.`
        : undefined;

      return {
        title: t`Cancel interval switching?`,
        subtitle: [
          t`This cancels the scheduled switch to ${upcomingIntervalAdjective} billing on ${getBeautifiedRenewDate()}.`,
          t`You keep ${currentIntervalAdjective} billing on the ${currentPlanLabel} plan.`,
          getChargeSentence(currentPlanKey, currentInterval, 'CURRENT'),
          keptSwitch,
        ]
          .filter(isDefined)
          .join(' '),
      };
    };

  const getBillingSubscriptionChangeWording = ({
    change,
    selectedInterval,
  }: {
    change: BillingSubscriptionChange;
    selectedInterval?: SettingsBillingPlanInterval;
  }): BillingSubscriptionChangeWording => {
    switch (change.type) {
      case 'SWITCH_PLAN':
        return getSwitchPlanWording(change.targetPlanKey, selectedInterval);
      case 'SWITCH_INTERVAL':
        return getSwitchIntervalWording(change.targetInterval);
      case 'CANCEL_PLAN_SWITCH':
        return getCancelPlanSwitchWording();
      case 'CANCEL_INTERVAL_SWITCH':
        return getCancelIntervalSwitchWording();
    }
  };

  return { getBillingSubscriptionChangeWording };
};
