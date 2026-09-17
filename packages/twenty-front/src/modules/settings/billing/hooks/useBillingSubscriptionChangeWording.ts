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
import { isBillingSubscriptionChangeImmediate } from '@/settings/billing/utils/isBillingSubscriptionChangeImmediate';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import {
  assertIsDefinedOrThrow,
  assertUnreachable,
  isDefined,
} from 'twenty-shared/utils';
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
  const subscriptionStatus = useSubscriptionStatus();
  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;
  const { formatPrices } = useFormatPrices();
  const { getBeautifiedRenewDate, getBillingPlanLabel, getIntervalLabel } =
    useBillingWording();

  const getIntervalAdjective = (interval: SubscriptionInterval) =>
    getIntervalLabel(interval === SubscriptionInterval.Month, true);

  const getPriceLabel = ({
    interval,
    planKey,
  }: {
    interval: SubscriptionInterval;
    planKey: BillingPlanKey;
  }) => {
    const price = formatNumber(formatPrices[planKey][interval]);

    return interval === SubscriptionInterval.Year
      ? t`$${price} per user per month, billed annually`
      : t`$${price} per user per month`;
  };

  const getChargeSentence = ({
    interval,
    planKey,
    timing,
  }: {
    interval: SubscriptionInterval;
    planKey: BillingPlanKey;
    timing: ChargeTiming;
  }) => {
    const priceLabel = getPriceLabel({ interval, planKey });

    switch (timing) {
      case 'CURRENT':
        return t`You are charged ${priceLabel}.`;
      case 'NOW':
        return t`You will be charged ${priceLabel}.`;
      case 'AFTER_TRIAL':
        return t`When your trial ends, you will be charged ${priceLabel}.`;
      case 'SCHEDULED':
        return t`From ${getBeautifiedRenewDate()}, you will be charged ${priceLabel}.`;
      default:
        return assertUnreachable(timing);
    }
  };

  const getChargeTiming = (change: BillingSubscriptionChange): ChargeTiming => {
    if (isTrialing) {
      return 'AFTER_TRIAL';
    }

    return isBillingSubscriptionChangeImmediate({ change, subscriptionStatus })
      ? 'NOW'
      : 'SCHEDULED';
  };

  const getSwitchPlanLeadSentence = (targetPlanKey: BillingPlanKey) => {
    if (isTrialing) {
      const planLabel = getBillingPlanLabel(targetPlanKey);

      return t`Your plan switches to ${planLabel} immediately and your trial continues.`;
    }

    if (targetPlanKey === BillingPlanKey.ENTERPRISE) {
      return t`Your plan switches to Organization immediately, with a prorated charge for the rest of your current billing period.`;
    }

    return t`Your plan switches to Pro on ${getBeautifiedRenewDate()}, at the end of your current billing period.`;
  };

  const getSwitchIntervalLeadSentence = (
    targetInterval: SettingsBillingPlanInterval,
  ) => {
    if (isTrialing) {
      const intervalAdjective = getIntervalAdjective(targetInterval);

      return t`Your billing switches to ${intervalAdjective} immediately and your trial continues.`;
    }

    if (targetInterval === SubscriptionInterval.Year) {
      return t`Your billing switches to annual immediately. A new annual period starts today and the unused part of your current period is credited.`;
    }

    return t`Your billing switches to monthly on ${getBeautifiedRenewDate()}, at the end of your current billing period.`;
  };

  const getStepNote = (selectedInterval: SettingsBillingPlanInterval) => {
    const upcomingIntervalAdjective = getIntervalAdjective(upcomingInterval);
    const selectedIntervalAdjective = getIntervalAdjective(selectedInterval);

    return t`Billing stays ${upcomingIntervalAdjective}. To switch to ${selectedIntervalAdjective} billing, confirm this change first, then switch the billing interval as a second step.`;
  };

  const getSwitchPlanWording = ({
    change,
    selectedInterval,
  }: {
    change: Extract<BillingSubscriptionChange, { type: 'SWITCH_PLAN' }>;
    selectedInterval: SettingsBillingPlanInterval | undefined;
  }): BillingSubscriptionChangeWording => ({
    title:
      change.targetPlanKey === BillingPlanKey.ENTERPRISE
        ? t`Upgrade to Organization?`
        : t`Switch to Pro?`,
    subtitle: [
      getSwitchPlanLeadSentence(change.targetPlanKey),
      getChargeSentence({
        interval: upcomingInterval,
        planKey: change.targetPlanKey,
        timing: getChargeTiming(change),
      }),
      isDefined(selectedInterval) && selectedInterval !== upcomingInterval
        ? getStepNote(selectedInterval)
        : undefined,
    ]
      .filter(isDefined)
      .join(' '),
  });

  const getSwitchIntervalWording = (
    change: Extract<BillingSubscriptionChange, { type: 'SWITCH_INTERVAL' }>,
  ): BillingSubscriptionChangeWording => ({
    title:
      change.targetInterval === SubscriptionInterval.Year
        ? t`Upgrade to annual billing?`
        : t`Switch to monthly billing?`,
    subtitle: [
      getSwitchIntervalLeadSentence(change.targetInterval),
      getChargeSentence({
        interval: change.targetInterval,
        planKey: upcomingPlanKey,
        timing: getChargeTiming(change),
      }),
    ].join(' '),
  });

  const getCancelPlanSwitchWording = (): BillingSubscriptionChangeWording => {
    const upcomingPlanLabel = getBillingPlanLabel(upcomingPlanKey);
    const currentPlanLabel = getBillingPlanLabel(currentPlanKey);
    const upcomingIntervalAdjective = getIntervalAdjective(upcomingInterval);

    return {
      title: t`Cancel plan switching?`,
      subtitle: [
        t`This cancels the scheduled switch to ${upcomingPlanLabel} on ${getBeautifiedRenewDate()}.`,
        t`You stay on the ${currentPlanLabel} plan.`,
        ...(isIntervalSwitchScheduled
          ? [
              t`Your scheduled switch to ${upcomingIntervalAdjective} billing on ${getBeautifiedRenewDate()} is kept.`,
              getChargeSentence({
                interval: upcomingInterval,
                planKey: currentPlanKey,
                timing: 'SCHEDULED',
              }),
            ]
          : [
              getChargeSentence({
                interval: currentInterval,
                planKey: currentPlanKey,
                timing: 'CURRENT',
              }),
            ]),
      ].join(' '),
    };
  };

  const getCancelIntervalSwitchWording =
    (): BillingSubscriptionChangeWording => {
      const upcomingIntervalAdjective = getIntervalAdjective(upcomingInterval);
      const currentIntervalAdjective = getIntervalAdjective(currentInterval);
      const currentPlanLabel = getBillingPlanLabel(currentPlanKey);
      const upcomingPlanLabel = getBillingPlanLabel(upcomingPlanKey);

      return {
        title: t`Cancel interval switching?`,
        subtitle: [
          t`This cancels the scheduled switch to ${upcomingIntervalAdjective} billing on ${getBeautifiedRenewDate()}.`,
          t`You keep ${currentIntervalAdjective} billing on the ${currentPlanLabel} plan.`,
          ...(isPlanSwitchScheduled
            ? [
                t`Your scheduled switch to ${upcomingPlanLabel} on ${getBeautifiedRenewDate()} is kept.`,
                getChargeSentence({
                  interval: currentInterval,
                  planKey: upcomingPlanKey,
                  timing: 'SCHEDULED',
                }),
              ]
            : [
                getChargeSentence({
                  interval: currentInterval,
                  planKey: currentPlanKey,
                  timing: 'CURRENT',
                }),
              ]),
        ].join(' '),
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
        return getSwitchPlanWording({ change, selectedInterval });
      case 'SWITCH_INTERVAL':
        return getSwitchIntervalWording(change);
      case 'CANCEL_PLAN_SWITCH':
        return getCancelPlanSwitchWording();
      case 'CANCEL_INTERVAL_SWITCH':
        return getCancelIntervalSwitchWording();
      default:
        return assertUnreachable(change);
    }
  };

  return { getBillingSubscriptionChangeWording };
};
