import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import {
  SubscriptionInfoHeaderRow,
  SubscriptionInfoRowContainer,
} from '@/settings/billing/components/internal/SubscriptionInfoRowContainer';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { PlansTags } from '@/settings/billing/components/internal/PlansTags';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { useHasNextBillingPhase } from '@/settings/billing/hooks/useHasNextBillingPhase';
import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { useNextBillingSeats } from '@/settings/billing/hooks/useNextBillingSeats';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconArrowDown,
  IconArrowUp,
  IconCalendarEvent,
  IconCalendarRepeat,
  IconCircleX,
  IconCoins,
  IconTag,
  IconUsers,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  BillingPlanKey,
  BillingProductKey,
  CancelSwitchBillingIntervalDocument,
  CancelSwitchBillingPlanDocument,
  CancelSwitchResourceCreditPriceDocument,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
  SwitchBillingPlanDocument,
  SwitchSubscriptionIntervalDocument,
} from '~/generated-metadata/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

const SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID =
  'switch-billing-interval-to-monthly-modal';

const SWITCH_BILLING_INTERVAL_TO_YEARLY_MODAL_ID =
  'switch-billing-interval-to-yearly-modal';

const SWITCH_BILLING_PLAN_TO_ENTERPRISE_MODAL_ID =
  'switch-billing-plan-to-enterprise-modal';

const SWITCH_BILLING_PLAN_TO_PRO_MODAL_ID = 'switch-billing-plan-to-pro-modal';

const END_TRIAL_PERIOD_MODAL_ID = 'end-trial-period-modal';

const CANCEL_SWITCH_BILLING_PLAN_MODAL_ID = 'cancel-switch-billing-plan-modal';

const CANCEL_SWITCH_BILLING_INTERVAL_MODAL_ID =
  'cancel-switch-billing-interval-modal';

const CANCEL_SWITCH_METERED_PRICE_MODAL_ID =
  'cancel-switch-metered-price-modal';

const StyledSwitchButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsBillingSubscriptionInfo = ({
  currentWorkspace,
  currentBillingSubscription,
}: {
  currentWorkspace: CurrentWorkspace;
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
}) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const { openModal } = useModal();

  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { currentResourceCreditBillingPrice } = useCurrentResourceCredit();

  const { currentPlan, oppositPlan } = useCurrentPlan();
  const { isEnterprisePlan, isYearlyPlan, isMonthlyPlan, isProPlan } =
    useCurrentBillingFlags();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const { hasNextBillingPhase } = useHasNextBillingPhase();
  const { nextPlan } = useNextPlan();
  const { nextBillingSeats } = useNextBillingSeats();
  const { nextBillingPhase } = useNextBillingPhase();
  const nextInterval =
    splitedPhaseItemsInPrices?.nextBasePrice?.recurringInterval;
  const nextResourceCreditPrice =
    splitedPhaseItemsInPrices.nextResourceCreditPrice;
  const subscriptionStatus = useSubscriptionStatus();

  const currentInterval = currentBillingSubscription.interval;

  const currentCreditsByPeriod =
    currentResourceCreditBillingPrice?.creditAmount ?? null;

  const nextCreditsByPeriod = nextResourceCreditPrice?.creditAmount ?? null;

  const {
    getIntervalLabelAsAdjectiveCapitalize,
    confirmationModalSwitchToProMessage,
    confirmationModalSwitchToOrganizationMessage,
    confirmationModalSwitchToMonthlyMessage,
    confirmationModalSwitchToYearlyMessage,
    confirmationModalCancelPlanSwitchingMessage,
    confirmationModalCancelIntervalSwitchingMessage,
    getBeautifiedRenewDate,
  } = useBillingWording();

  const [switchSubscriptionIntervalMutation] = useMutation(
    SwitchSubscriptionIntervalDocument,
  );

  const [switchBillingPlan] = useMutation(SwitchBillingPlanDocument);

  const [cancelSwitchBillingInterval] = useMutation(
    CancelSwitchBillingIntervalDocument,
  );

  const [cancelSwitchBillingPlan] = useMutation(
    CancelSwitchBillingPlanDocument,
  );

  const [cancelSwitchResourceCreditPrice] = useMutation(
    CancelSwitchResourceCreditPriceDocument,
  );

  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const isTrialPeriod = subscriptionStatus === SubscriptionStatus.Trialing;

  const canSwitchSubscription =
    subscriptionStatus !== SubscriptionStatus.PastDue;

  const { endTrialPeriod, isLoading: isEndTrialPeriodLoading } =
    useEndSubscriptionTrialPeriod();

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    usePermissionFlagMap();

  const seats = currentBillingSubscription.billingSubscriptionItems?.find(
    (item) =>
      item.billingProduct.metadata.productKey ===
      BillingProductKey.BASE_PRODUCT,
  )?.quantity as number | undefined;

  // Loading states to avoid race conditions on actions
  const [isSwitchingInterval, setIsSwitchingInterval] = useState(false);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);
  const [isCancellingPlanSwitch, setIsCancellingPlanSwitch] = useState(false);
  const [isCancellingIntervalSwitch, setIsCancellingIntervalSwitch] =
    useState(false);
  const [isCancellingMeteredSwitch, setIsCancellingMeteredSwitch] =
    useState(false);

  const isAnyActionLoading = useMemo(
    () =>
      isSwitchingInterval ||
      isSwitchingPlan ||
      isCancellingPlanSwitch ||
      isCancellingIntervalSwitch ||
      isCancellingMeteredSwitch ||
      isEndTrialPeriodLoading,
    [
      isSwitchingInterval,
      isSwitchingPlan,
      isCancellingPlanSwitch,
      isCancellingIntervalSwitch,
      isCancellingMeteredSwitch,
      isEndTrialPeriodLoading,
    ],
  );

  const refreshWorkspace = ({
    currentBillingSubscription,
    billingSubscriptions,
  }: Pick<
    CurrentWorkspace,
    'currentBillingSubscription' | 'billingSubscriptions'
  >) => {
    setCurrentWorkspace({
      ...currentWorkspace,
      currentBillingSubscription,
      billingSubscriptions,
    });
    refetchResourceCreditUsage();
  };

  const switchInterval = async () => {
    if (isAnyActionLoading || isSwitchingInterval) return;
    setIsSwitchingInterval(true);
    try {
      const { success } = await endTrialPeriodIfNeeded();
      if (success === false) {
        return;
      }
      const { data } = await switchSubscriptionIntervalMutation();

      const beautifiedRenewDate = getBeautifiedRenewDate();
      const isCurrentMonth =
        currentBillingSubscription.interval === SubscriptionInterval.Month;
      const message = isCurrentMonth
        ? t`Subscription has been switched to Yearly.`
        : t`Subscription will be switch to Monthly the ${beautifiedRenewDate}.`;

      if (
        isDefined(data?.switchSubscriptionInterval.currentBillingSubscription)
      ) {
        refreshWorkspace(data.switchSubscriptionInterval);
      }
      enqueueSuccessSnackBar({ message });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription.`,
      });
    } finally {
      setIsSwitchingInterval(false);
    }
  };

  const endTrialPeriodIfNeeded = async () => {
    if (currentBillingSubscription.status === SubscriptionStatus.Trialing) {
      return await endTrialPeriod();
    }
    return { success: true };
  };

  const switchPlan = async () => {
    if (isAnyActionLoading || isSwitchingPlan) return;
    setIsSwitchingPlan(true);
    try {
      const { success } = await endTrialPeriodIfNeeded();
      if (success === false) {
        return;
      }
      const { data } = await switchBillingPlan();
      if (isDefined(data?.switchBillingPlan.currentBillingSubscription)) {
        refreshWorkspace(data.switchBillingPlan);
      }
      const beautifiedRenewDate = getBeautifiedRenewDate();
      enqueueSuccessSnackBar({
        message:
          oppositPlan === BillingPlanKey.ENTERPRISE
            ? t`Subscription has been switched to ${oppositPlan} Plan.`
            : t`Subscription will be switched to ${oppositPlan} Plan the ${beautifiedRenewDate}.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription to ${oppositPlan} Plan.`,
      });
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  const cancelPlanSwitching = async () => {
    if (isAnyActionLoading || isCancellingPlanSwitch) return;
    setIsCancellingPlanSwitch(true);
    try {
      const { data } = await cancelSwitchBillingPlan();

      if (isDefined(data?.cancelSwitchBillingPlan.currentBillingSubscription)) {
        refreshWorkspace(data.cancelSwitchBillingPlan);
      }

      enqueueSuccessSnackBar({
        message: t`Plan switching has been cancelled.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while cancelling plan switching.`,
      });
    } finally {
      setIsCancellingPlanSwitch(false);
    }
  };

  const cancelIntervalSwitching = async () => {
    if (isAnyActionLoading || isCancellingIntervalSwitch) return;
    setIsCancellingIntervalSwitch(true);
    try {
      const { data } = await cancelSwitchBillingInterval();
      if (
        isDefined(data?.cancelSwitchBillingInterval.currentBillingSubscription)
      ) {
        refreshWorkspace(data.cancelSwitchBillingInterval);
      }
      enqueueSuccessSnackBar({
        message: t`Interval switching has been cancelled.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while cancelling interval switching.`,
      });
    } finally {
      setIsCancellingIntervalSwitch(false);
    }
  };

  const cancelResourceCreditSwitching = async () => {
    if (isAnyActionLoading || isCancellingMeteredSwitch) return;
    setIsCancellingMeteredSwitch(true);
    try {
      const { data } = await cancelSwitchResourceCreditPrice();

      if (
        isDefined(
          data?.cancelSwitchResourceCreditPrice?.currentBillingSubscription,
        )
      ) {
        refreshWorkspace(data.cancelSwitchResourceCreditPrice);
      }

      enqueueSuccessSnackBar({
        message: t`Credit pack switching has been cancelled.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while cancelling credit pack switching.`,
      });
    } finally {
      setIsCancellingMeteredSwitch(false);
    }
  };

  return (
    <Section>
      <H2Title title={t`Subscription`} description={t`About my subscription`} />
      <SubscriptionInfoContainer>
        <SubscriptionInfoHeaderRow show={hasNextBillingPhase} />
        <SubscriptionInfoRowContainer
          label={t`Plan`}
          Icon={IconTag}
          currentValue={
            <PlansTags
              plan={currentPlan.planKey}
              isTrialPeriod={isTrialPeriod}
            />
          }
          nextValue={
            nextPlan ? (
              <PlansTags
                plan={nextPlan.planKey}
                isTrialPeriod={isTrialPeriod}
              />
            ) : undefined
          }
        />
        <SubscriptionInfoRowContainer
          label={t`Billing interval`}
          Icon={IconCalendarEvent}
          currentValue={getIntervalLabelAsAdjectiveCapitalize(
            currentInterval === SubscriptionInterval.Month,
          )}
          nextValue={
            nextInterval
              ? getIntervalLabelAsAdjectiveCapitalize(
                  nextInterval === SubscriptionInterval.Month,
                )
              : undefined
          }
        />
        {currentBillingSubscription.currentPeriodEnd && (
          <SubscriptionInfoRowContainer
            label={t`Renewal date`}
            Icon={IconCalendarRepeat}
            currentValue={getBeautifiedRenewDate()}
            nextValue={
              nextBillingPhase
                ? beautifyExactDate(nextBillingPhase.end_date * 1000)
                : undefined
            }
          />
        )}
        <SubscriptionInfoRowContainer
          label={t`Seats`}
          Icon={IconUsers}
          currentValue={seats}
          nextValue={nextBillingSeats}
        />
        <SubscriptionInfoRowContainer
          label={t`Credits by period`}
          Icon={IconCoins}
          currentValue={
            isDefined(currentCreditsByPeriod)
              ? formatNumber(currentCreditsByPeriod, {
                  abbreviate: true,
                  decimals: 2,
                })
              : undefined
          }
          nextValue={
            isDefined(nextCreditsByPeriod)
              ? formatNumber(nextCreditsByPeriod, {
                  abbreviate: true,
                  decimals: 2,
                })
              : undefined
          }
        />
      </SubscriptionInfoContainer>
      <StyledSwitchButtonContainer>
        {isTrialPeriod && hasPermissionToEndTrialPeriod && (
          <Button
            Icon={IconArrowUp}
            title={t`Subscribe Now`}
            variant="secondary"
            onClick={() => openModal(END_TRIAL_PERIOD_MODAL_ID)}
            disabled={isEndTrialPeriodLoading || isAnyActionLoading}
          />
        )}
        {nextInterval && currentInterval !== nextInterval && (
          <Button
            Icon={IconCircleX}
            title={t`Cancel interval switching`}
            variant="secondary"
            onClick={() => openModal(CANCEL_SWITCH_BILLING_INTERVAL_MODAL_ID)}
            disabled={!canSwitchSubscription || isAnyActionLoading}
          />
        )}
        {isMonthlyPlan &&
          (!nextInterval || currentInterval === nextInterval) && (
            <Button
              Icon={IconArrowUp}
              title={t`Switch to Yearly`}
              variant="secondary"
              onClick={() =>
                openModal(SWITCH_BILLING_INTERVAL_TO_YEARLY_MODAL_ID)
              }
              disabled={!canSwitchSubscription || isAnyActionLoading}
            />
          )}
        {isYearlyPlan &&
          (!nextInterval || currentInterval === nextInterval) && (
            <Button
              Icon={IconArrowUp}
              title={t`Switch to Monthly`}
              variant="secondary"
              onClick={() =>
                openModal(SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID)
              }
              disabled={!canSwitchSubscription || isAnyActionLoading}
            />
          )}
        {isProPlan &&
          (!nextPlan || currentPlan.planKey === nextPlan.planKey) && (
            <Button
              Icon={IconArrowUp}
              title={t`Switch to Organization`}
              variant="secondary"
              onClick={() =>
                openModal(SWITCH_BILLING_PLAN_TO_ENTERPRISE_MODAL_ID)
              }
              disabled={!canSwitchSubscription || isAnyActionLoading}
            />
          )}
        {isEnterprisePlan &&
          (!nextPlan || currentPlan.planKey === nextPlan.planKey) && (
            <Button
              Icon={IconArrowDown}
              title={t`Switch to Pro`}
              variant="secondary"
              onClick={() => openModal(SWITCH_BILLING_PLAN_TO_PRO_MODAL_ID)}
              disabled={!canSwitchSubscription || isAnyActionLoading}
            />
          )}
        {nextPlan && currentPlan.planKey !== nextPlan.planKey && (
          <Button
            Icon={IconCircleX}
            title={t`Cancel plan switching`}
            variant="secondary"
            onClick={() => openModal(CANCEL_SWITCH_BILLING_PLAN_MODAL_ID)}
            disabled={!canSwitchSubscription || isAnyActionLoading}
          />
        )}
        {nextResourceCreditPrice &&
          currentCreditsByPeriod !== nextCreditsByPeriod && (
            <Button
              Icon={IconCircleX}
              title={t`Cancel credit pack switching`}
              variant="secondary"
              onClick={() => openModal(CANCEL_SWITCH_METERED_PRICE_MODAL_ID)}
              disabled={!canSwitchSubscription || isAnyActionLoading}
            />
          )}
      </StyledSwitchButtonContainer>
      <ConfirmationModal
        modalInstanceId={SWITCH_BILLING_INTERVAL_TO_YEARLY_MODAL_ID}
        title={t`Change to Yearly?`}
        subtitle={confirmationModalSwitchToYearlyMessage()}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalInstanceId={SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID}
        title={t`Change to Monthly?`}
        subtitle={confirmationModalSwitchToMonthlyMessage()}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalInstanceId={CANCEL_SWITCH_BILLING_INTERVAL_MODAL_ID}
        title={t`Cancel interval switching?`}
        subtitle={confirmationModalCancelIntervalSwitchingMessage()}
        onConfirmClick={cancelIntervalSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingIntervalSwitch}
      />
      <ConfirmationModal
        modalInstanceId={SWITCH_BILLING_PLAN_TO_ENTERPRISE_MODAL_ID}
        title={t`Change to Organization Plan?`}
        subtitle={confirmationModalSwitchToOrganizationMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalInstanceId={SWITCH_BILLING_PLAN_TO_PRO_MODAL_ID}
        title={t`Change to Pro Plan?`}
        subtitle={confirmationModalSwitchToProMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalInstanceId={CANCEL_SWITCH_BILLING_PLAN_MODAL_ID}
        title={t`Cancel plan switching?`}
        subtitle={confirmationModalCancelPlanSwitchingMessage()}
        onConfirmClick={cancelPlanSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingPlanSwitch}
      />
      <ConfirmationModal
        modalInstanceId={END_TRIAL_PERIOD_MODAL_ID}
        title={t`Start Your Subscription`}
        subtitle={t`We will activate your paid plan. Do you want to proceed?`}
        onConfirmClick={endTrialPeriod}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isEndTrialPeriodLoading}
      />
      <ConfirmationModal
        modalInstanceId={CANCEL_SWITCH_METERED_PRICE_MODAL_ID}
        title={t`Cancel credit pack switching?`}
        subtitle={t`You have scheduled a credit pack change. Do you want to cancel it?`}
        onConfirmClick={cancelResourceCreditSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingMeteredSwitch}
      />
    </Section>
  );
};
