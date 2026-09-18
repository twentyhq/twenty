import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { SettingsBillingSubscriptionInfoCard } from '@/settings/billing/components/internal/SettingsBillingSubscriptionInfoCard';
import { SettingsBillingSubscriptionInfoCardHeaderActions } from '@/settings/billing/components/internal/SettingsBillingSubscriptionInfoCardHeaderActions';
import { SettingsBillingSubscriptionInfoModals } from '@/settings/billing/components/internal/SettingsBillingSubscriptionInfoModals';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useApplyBillingSubscriptionChange } from '@/settings/billing/hooks/useApplyBillingSubscriptionChange';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingSubscriptionCost } from '@/settings/billing/hooks/useBillingSubscriptionCost';
import { useBillingSubscriptionChangeWording } from '@/settings/billing/hooks/useBillingSubscriptionChangeWording';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { useNextInterval } from '@/settings/billing/hooks/useNextInterval';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconClockPlay, IconCoins, IconTag } from 'twenty-ui/icon';
import {
  BillingPlanKey,
  CancelSwitchResourceCreditPriceDocument,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

import { useToast } from 'twenty-ui/primitives/feedback';

export const SettingsBillingSubscriptionInfo = ({
  currentWorkspace,
  currentBillingSubscription,
  onManageBilling,
  isManageBillingDisabled,
  onUpdatePayment,
  isUpdatePaymentDisabled,
}: {
  currentWorkspace: CurrentWorkspace;
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
  onManageBilling: () => void;
  isManageBillingDisabled: boolean;
  onUpdatePayment: () => void;
  isUpdatePaymentDisabled: boolean;
}) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const { openDialog } = useDialog();

  const { enqueueToast } = useToast();

  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const { currentResourceCreditBillingPrice } = useCurrentResourceCredit();

  const { currentPlan } = useCurrentPlan();
  const { isEnterprisePlan, isYearlyPlan, isMonthlyPlan, isProPlan } =
    useCurrentBillingFlags();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const { nextBillingPhase } = useNextBillingPhase();
  const { nextPlan } = useNextPlan();
  const { nextInterval } = useNextInterval();
  const nextResourceCreditPrice =
    splitedPhaseItemsInPrices.nextResourceCreditPrice;
  const subscriptionStatus = useSubscriptionStatus();

  const currentInterval = currentBillingSubscription.interval;

  const currentCreditsByPeriod =
    currentResourceCreditBillingPrice?.creditAmount ?? null;

  const nextCreditsByPeriod = nextResourceCreditPrice?.creditAmount ?? null;

  const {
    getBeautifiedRenewDate,
    getBillingPlanLabel,
    getIntervalLabelAsAdjectiveCapitalize,
  } = useBillingWording();
  const { getBillingSubscriptionChangeWording } =
    useBillingSubscriptionChangeWording();
  const {
    applyBillingSubscriptionChange,
    isApplyingBillingSubscriptionChange,
  } = useApplyBillingSubscriptionChange();

  const [cancelSwitchResourceCreditPrice] = useMutation(
    CancelSwitchResourceCreditPriceDocument,
  );

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const isTrialPeriod = subscriptionStatus === SubscriptionStatus.Trialing;
  const shouldUpdatePayment = isSubscriptionPaymentOverdue(subscriptionStatus);

  const scheduledCancellationDate = currentBillingSubscription.cancelAt;
  const isCancellationScheduled =
    currentBillingSubscription.status !== SubscriptionStatus.Canceled &&
    isDefined(scheduledCancellationDate);
  const scheduledCancellationDateLabel = isDefined(scheduledCancellationDate)
    ? beautifyExactDate(scheduledCancellationDate)
    : undefined;

  const canSwitchSubscription =
    subscriptionStatus !== SubscriptionStatus.PastDue &&
    !isCancellationScheduled;

  const { endTrialPeriod, isLoading: isEndTrialPeriodLoading } =
    useEndSubscriptionTrialPeriod();

  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  const startSubscriptionAfterPaymentMethodAdded = async () => {
    await endTrialPeriod({ skipPaymentMethodRedirect: true });
  };

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    usePermissionFlagMap();

  const {
    seats,
    perSeatAmountCents,
    seatsSubtotalCents,
    creditsSubtotalCents,
    totalCents,
  } = useBillingSubscriptionCost();

  const formatCentsToDisplay = (cents: number | null | undefined) =>
    isDefined(cents) ? formatNumber(cents / 100, { decimals: 2 }) : undefined;

  const formatBillingPeriodCentsToMonthlyDisplay = (
    cents: number | null | undefined,
  ) =>
    isDefined(cents)
      ? formatNumber(
          (currentInterval === SubscriptionInterval.Year ? cents / 12 : cents) /
            100,
          { decimals: 2 },
        )
      : undefined;

  const perSeatPriceDisplay = formatCentsToDisplay(perSeatAmountCents);
  const displayedPerSeatPrice =
    formatBillingPeriodCentsToMonthlyDisplay(perSeatAmountCents);

  const totalDisplay = formatBillingPeriodCentsToMonthlyDisplay(totalCents);
  const seatsSubtotalDisplay =
    formatBillingPeriodCentsToMonthlyDisplay(seatsSubtotalCents);
  const creditsSubtotalDisplay =
    formatBillingPeriodCentsToMonthlyDisplay(creditsSubtotalCents);

  const totalRenewDate = isDefined(currentBillingSubscription.currentPeriodEnd)
    ? getBeautifiedRenewDate()
    : undefined;
  const displayedSubscriptionDate = isCancellationScheduled
    ? scheduledCancellationDateLabel
    : totalRenewDate;
  const subscriptionDateLabel = isCancellationScheduled
    ? t`End date`
    : t`Renewal date`;

  const subscriptionDescription =
    isCancellationScheduled && isDefined(scheduledCancellationDateLabel)
      ? t`Your subscription is scheduled to end on ${scheduledCancellationDateLabel}. You will keep access until then`
      : isDefined(totalRenewDate)
        ? t`Next charge ${totalRenewDate}. Invoice amount may vary if you add members or credits between periods`
        : t`Invoice amount may vary if you add members or credits between periods`;

  const planLabel =
    currentPlan.planKey === BillingPlanKey.PRO
      ? t`Pro plan`
      : t`Organization plan`;
  const planName =
    currentPlan.planKey === BillingPlanKey.PRO
      ? t`pro plan`
      : t`organization plan`;
  const intervalUnit =
    currentInterval === SubscriptionInterval.Month ? t`month` : t`year`;
  const startSubscriptionSubtitle = isDefined(perSeatPriceDisplay)
    ? t`We will activate your $${perSeatPriceDisplay}/user/${intervalUnit} ${planName}. Do you want to proceed?`
    : t`We will activate your ${planName}. Do you want to proceed?`;

  const statusDescriptor = (() => {
    if (isCancellationScheduled) {
      return {
        label: t`Ending`,
        tone: 'orange' as const,
      };
    }

    switch (currentBillingSubscription.status) {
      case SubscriptionStatus.Active:
        return { label: t`Active`, tone: 'blue' as const };
      case SubscriptionStatus.Trialing:
        return { label: t`Trial`, tone: 'sky' as const };
      case SubscriptionStatus.PastDue:
        return { label: t`Past due`, tone: 'red' as const };
      case SubscriptionStatus.Canceled:
        return { label: t`Canceled`, tone: 'gray' as const };
      case SubscriptionStatus.Incomplete:
        return { label: t`Incomplete`, tone: 'orange' as const };
      case SubscriptionStatus.IncompleteExpired:
        return { label: t`Incomplete expired`, tone: 'gray' as const };
      case SubscriptionStatus.Paused:
        return { label: t`Paused`, tone: 'gray' as const };
      case SubscriptionStatus.Unpaid:
        return { label: t`Unpaid`, tone: 'red' as const };
      default:
        return { label: t`Unknown`, tone: 'gray' as const };
    }
  })();

  const currentIntervalLabel = getIntervalLabelAsAdjectiveCapitalize(
    currentInterval === SubscriptionInterval.Month,
  );

  const seatsSubtotalValue = isDefined(seatsSubtotalDisplay)
    ? `$${seatsSubtotalDisplay}`
    : '-';
  const seatCountLabel = seats === 1 ? t`seat` : t`seats`;
  const seatsSubtotalDetails =
    isDefined(seats) && isDefined(displayedPerSeatPrice)
      ? t`(${seats} ${seatCountLabel} × $${displayedPerSeatPrice})`
      : undefined;

  const creditsSubtotalValue = isDefined(creditsSubtotalDisplay)
    ? `$${creditsSubtotalDisplay}`
    : '-';
  const creditsSubtotalDetails = isDefined(currentCreditsByPeriod)
    ? t`(${formatNumber(currentCreditsByPeriod, { decimals: 2 })} credits)`
    : undefined;
  const totalValue = isDefined(totalDisplay) ? `$${totalDisplay}` : '-';
  const totalIntervalSubtitle = isDefined(totalDisplay)
    ? currentInterval === SubscriptionInterval.Month
      ? t`/month`
      : t`/month billed annually`
    : undefined;
  const scheduledChangeStartDate = isDefined(nextBillingPhase?.start_date)
    ? beautifyExactDate(nextBillingPhase.start_date * 1000)
    : undefined;

  const canDisplaySwitchToYearlyAction =
    !isCancellationScheduled &&
    !shouldUpdatePayment &&
    isMonthlyPlan &&
    (!nextInterval || currentInterval === nextInterval);
  const canDisplaySwitchToMonthlyAction =
    !isCancellationScheduled &&
    !shouldUpdatePayment &&
    isYearlyPlan &&
    (!nextInterval || currentInterval === nextInterval);
  const canComparePlans =
    (isProPlan || isEnterprisePlan) &&
    (!nextPlan || currentPlan.planKey === nextPlan.planKey);
  const canCancelIntervalSwitch =
    isDefined(nextInterval) && currentInterval !== nextInterval;
  const canStartSubscription = isTrialPeriod && hasPermissionToEndTrialPeriod;
  const canCancelPlanSwitch =
    isDefined(nextPlan) && currentPlan.planKey !== nextPlan.planKey;

  const scheduledChangeItems = [
    ...(nextPlan && currentPlan.planKey !== nextPlan.planKey
      ? [
          {
            Icon: IconTag,
            label: t`Plan`,
            value: getBillingPlanLabel(nextPlan.planKey),
          },
        ]
      : []),
    ...(nextInterval && currentInterval !== nextInterval
      ? [
          {
            Icon: IconClockPlay,
            label: t`Billing interval`,
            value: getIntervalLabelAsAdjectiveCapitalize(
              nextInterval === SubscriptionInterval.Month,
            ),
          },
        ]
      : []),
    ...(isDefined(nextCreditsByPeriod) &&
    currentCreditsByPeriod !== nextCreditsByPeriod
      ? [
          {
            Icon: IconCoins,
            label: t`Credits`,
            value: t`${formatNumber(nextCreditsByPeriod, {
              decimals: 2,
            })} credits`,
          },
        ]
      : []),
  ];
  const [isCancellingMeteredSwitch, setIsCancellingMeteredSwitch] =
    useState(false);

  const isAnyActionLoading =
    isApplyingBillingSubscriptionChange ||
    isCancellingMeteredSwitch ||
    isEndTrialPeriodLoading;

  const isSubscriptionActionDisabled =
    !canSwitchSubscription || isAnyActionLoading;

  const applyBillingUpdate = (
    billingUpdate: Parameters<typeof applyCurrentWorkspaceBillingUpdate>[0],
  ) => {
    applyCurrentWorkspaceBillingUpdate(billingUpdate, {
      onBillingUpdateApplied: refetchResourceCreditUsage,
    });
  };

  const runBillingAction = async ({
    action,
    getErrorMessage,
    getSuccessMessage,
    isLoading,
    setIsLoading,
  }: {
    action: () => Promise<void>;
    getErrorMessage: () => string;
    getSuccessMessage: () => string;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
  }) => {
    if (isAnyActionLoading || isLoading) return;

    setIsLoading(true);
    try {
      await action();

      enqueueToast({ variant: 'success', children: getSuccessMessage() });
    } catch (error) {
      enqueueToast({ variant: 'error', children: getErrorMessage() });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelResourceCreditSwitching = async () => {
    await runBillingAction({
      action: async () => {
        const { data } = await cancelSwitchResourceCreditPrice();

        if (
          isDefined(
            data?.cancelSwitchResourceCreditPrice?.currentBillingSubscription,
          )
        ) {
          applyBillingUpdate(data.cancelSwitchResourceCreditPrice);
        }
      },
      getErrorMessage: () => t`Error while cancelling credit pack switching.`,
      getSuccessMessage: () => t`Credit pack switching has been cancelled.`,
      isLoading: isCancellingMeteredSwitch,
      setIsLoading: setIsCancellingMeteredSwitch,
    });
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Subscription`}
        description={subscriptionDescription}
      />
      <SettingsBillingSubscriptionInfoCard
        canDisplaySwitchToMonthlyAction={canDisplaySwitchToMonthlyAction}
        canDisplaySwitchToYearlyAction={canDisplaySwitchToYearlyAction}
        creditsSubtotalDetails={creditsSubtotalDetails}
        creditsSubtotalValue={creditsSubtotalValue}
        currentIntervalLabel={currentIntervalLabel}
        displayedSubscriptionDate={displayedSubscriptionDate}
        headerActions={
          <SettingsBillingSubscriptionInfoCardHeaderActions
            canCancelIntervalSwitch={canCancelIntervalSwitch}
            canCancelPlanSwitch={canCancelPlanSwitch}
            canComparePlans={canComparePlans}
            canStartSubscription={canStartSubscription}
            isComparePlansActionPrimary={isProPlan && !isTrialPeriod}
            isCancellationScheduled={isCancellationScheduled}
            isEndTrialPeriodDisabled={
              isEndTrialPeriodLoading || isAnyActionLoading
            }
            isSubscriptionActionDisabled={isSubscriptionActionDisabled}
            isManageBillingDisabled={isManageBillingDisabled}
            isUpdatePaymentDisabled={isUpdatePaymentDisabled}
            onCancelIntervalSwitch={() =>
              openDialog(BILLING_MODAL_IDS.cancelSwitchBillingInterval)
            }
            onCancelPlanSwitch={() =>
              openDialog(BILLING_MODAL_IDS.cancelSwitchBillingPlan)
            }
            onEndTrialPeriod={() =>
              openDialog(BILLING_MODAL_IDS.endTrialPeriod)
            }
            onManageBilling={onManageBilling}
            onUpdatePayment={onUpdatePayment}
            shouldUpdatePayment={shouldUpdatePayment}
          />
        }
        isSubscriptionActionDisabled={isSubscriptionActionDisabled}
        onSwitchToMonthly={() =>
          openDialog(BILLING_MODAL_IDS.switchBillingIntervalToMonthly)
        }
        onSwitchToYearly={() =>
          openDialog(BILLING_MODAL_IDS.switchBillingIntervalToYearly)
        }
        planLabel={planLabel}
        scheduledChangeItems={scheduledChangeItems}
        scheduledChangeStartDate={scheduledChangeStartDate}
        seatsSubtotalDetails={seatsSubtotalDetails}
        seatsSubtotalValue={seatsSubtotalValue}
        statusDescriptor={statusDescriptor}
        subscriptionDateLabel={subscriptionDateLabel}
        totalIntervalSubtitle={totalIntervalSubtitle}
        totalValue={totalValue}
        totalWorkspaceMembersCount={currentWorkspace.workspaceMembersCount}
        workspaceMemberDefaultName={t`Workspace member`}
        workspaceMembers={currentWorkspaceMembers}
      />
      <SettingsBillingSubscriptionInfoModals
        billingHasPaymentMethod={billingHasPaymentMethod}
        cancelIntervalSwitchingWording={getBillingSubscriptionChangeWording({
          change: { type: 'CANCEL_INTERVAL_SWITCH' },
        })}
        cancelPlanSwitchingWording={getBillingSubscriptionChangeWording({
          change: { type: 'CANCEL_PLAN_SWITCH' },
        })}
        isApplyingSubscriptionChange={isApplyingBillingSubscriptionChange}
        isCancellingMeteredSwitch={isCancellingMeteredSwitch}
        isEndTrialPeriodLoading={isEndTrialPeriodLoading}
        onCancelIntervalSwitching={() =>
          applyBillingSubscriptionChange({ type: 'CANCEL_INTERVAL_SWITCH' })
        }
        onCancelPlanSwitching={() =>
          applyBillingSubscriptionChange({ type: 'CANCEL_PLAN_SWITCH' })
        }
        onCancelResourceCreditSwitching={cancelResourceCreditSwitching}
        onEndTrialPeriod={endTrialPeriod}
        onPaymentMethodAdded={startSubscriptionAfterPaymentMethodAdded}
        onSwitchInterval={() =>
          applyBillingSubscriptionChange({
            type: 'SWITCH_INTERVAL',
            targetInterval: isMonthlyPlan
              ? SubscriptionInterval.Year
              : SubscriptionInterval.Month,
          })
        }
        startSubscriptionSubtitle={startSubscriptionSubtitle}
        switchToMonthlyWording={getBillingSubscriptionChangeWording({
          change: {
            type: 'SWITCH_INTERVAL',
            targetInterval: SubscriptionInterval.Month,
          },
        })}
        switchToYearlyWording={getBillingSubscriptionChangeWording({
          change: {
            type: 'SWITCH_INTERVAL',
            targetInterval: SubscriptionInterval.Year,
          },
        })}
      />
    </Section.Root>
  );
};
