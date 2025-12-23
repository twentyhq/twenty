import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import {
  SubscriptionInfoHeaderRow,
  SubscriptionInfoRowContainer,
} from '@/billing/components/internal/SubscriptionInfoRowContainer';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';

import { PlansTags } from '@/billing/components/internal/PlansTags';
import { useBillingWording } from '@/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/billing/hooks/useCurrentBillingFlags';
import { useCurrentMetered } from '@/billing/hooks/useCurrentMetered';
import { useCurrentPlan } from '@/billing/hooks/useCurrentPlan';
import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { useGetWorkflowNodeExecutionUsage } from '@/billing/hooks/useGetWorkflowNodeExecutionUsage';
import { useHasNextBillingPhase } from '@/billing/hooks/useHasNextBillingPhase';
import { useNextBillingPhase } from '@/billing/hooks/useNextBillingPhase';
import { useNextBillingSeats } from '@/billing/hooks/useNextBillingSeats';
import { useNextPlan } from '@/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/billing/hooks/useSplitPhaseItemsInPrices';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
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
import {
  BillingPlanKey,
  BillingProductKey,
  PermissionFlagType,
  SubscriptionInterval,
  useCancelSwitchBillingIntervalMutation,
  useCancelSwitchBillingPlanMutation,
  useCancelSwitchMeteredPriceMutation,
  useSwitchBillingPlanMutation,
  useSwitchSubscriptionIntervalMutation,
} from '~/generated-metadata/graphql';
import { SubscriptionStatus } from '~/generated/graphql';
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
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
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

  const { refetchMeteredProductsUsage } = useGetWorkflowNodeExecutionUsage();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { currentMeteredBillingPrice } = useCurrentMetered();

  const { currentPlan, oppositPlan } = useCurrentPlan();
  const { isEnterprisePlan, isYearlyPlan, isMonthlyPlan, isProPlan } =
    useCurrentBillingFlags();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const { hasNextBillingPhase } = useHasNextBillingPhase();
  const { nextPlan } = useNextPlan();
  const { nextBillingSeats } = useNextBillingSeats();
  const { nextBillingPhase } = useNextBillingPhase();
  const nextInterval =
    splitedPhaseItemsInPrices?.nextLicensedPrice?.recurringInterval;
  const nextMeteredBillingPrice = splitedPhaseItemsInPrices.nextMereredPrice;
  const subscriptionStatus = useSubscriptionStatus();

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

  const [switchSubscriptionIntervalMutation] =
    useSwitchSubscriptionIntervalMutation();

  const [switchBillingPlan] = useSwitchBillingPlanMutation();

  const [cancelSwitchBillingInterval] =
    useCancelSwitchBillingIntervalMutation();

  const [cancelSwitchBillingPlan] = useCancelSwitchBillingPlanMutation();

  const [cancelSwitchMeteredPrice] = useCancelSwitchMeteredPriceMutation();

  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

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
    refetchMeteredProductsUsage();
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

  const cancelMeteredSwitching = async () => {
    if (isAnyActionLoading || isCancellingMeteredSwitch) return;
    setIsCancellingMeteredSwitch(true);
    try {
      const { data } = await cancelSwitchMeteredPrice();

      if (
        isDefined(data?.cancelSwitchMeteredPrice?.currentBillingSubscription)
      ) {
        refreshWorkspace(data.cancelSwitchMeteredPrice);
      }

      enqueueSuccessSnackBar({
        message: t`Metered tier switching has been cancelled.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while cancelling metered tier switching.`,
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
            currentMeteredBillingPrice.recurringInterval ===
              SubscriptionInterval.Month,
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
          currentValue={formatNumber(currentMeteredBillingPrice.tiers[0].upTo, {
            abbreviate: true,
            decimals: 2,
          })}
          nextValue={
            nextMeteredBillingPrice
              ? formatNumber(nextMeteredBillingPrice.tiers[0].upTo, {
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
        {nextInterval &&
          currentMeteredBillingPrice.recurringInterval !== nextInterval && (
            <Button
              Icon={IconCircleX}
              title={t`Cancel interval switching`}
              variant="secondary"
              onClick={() => openModal(CANCEL_SWITCH_BILLING_INTERVAL_MODAL_ID)}
              disabled={!canSwitchSubscription || isAnyActionLoading}
            />
          )}
        {isMonthlyPlan &&
          (!nextInterval ||
            currentMeteredBillingPrice.recurringInterval === nextInterval) && (
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
          (!nextInterval ||
            currentMeteredBillingPrice.recurringInterval === nextInterval) && (
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
              Icon={IconArrowUp}
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
        {/*@todo: find a way to check if the metered tier match when interval change too*/}
        {nextInterval &&
          nextMeteredBillingPrice &&
          currentMeteredBillingPrice.recurringInterval === nextInterval &&
          currentMeteredBillingPrice.tiers[0].upTo !==
            nextMeteredBillingPrice.tiers[0].upTo && (
            <Button
              Icon={IconCircleX}
              title={t`Cancel metered tier switching`}
              variant="secondary"
              onClick={() => openModal(CANCEL_SWITCH_METERED_PRICE_MODAL_ID)}
              disabled={!canSwitchSubscription || isAnyActionLoading}
            />
          )}
      </StyledSwitchButtonContainer>
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_TO_YEARLY_MODAL_ID}
        title={t`Change to Yearly?`}
        subtitle={confirmationModalSwitchToYearlyMessage()}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID}
        title={t`Change to Monthly?`}
        subtitle={confirmationModalSwitchToMonthlyMessage()}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalId={CANCEL_SWITCH_BILLING_INTERVAL_MODAL_ID}
        title={t`Cancel interval switching?`}
        subtitle={confirmationModalCancelIntervalSwitchingMessage()}
        onConfirmClick={cancelIntervalSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingIntervalSwitch}
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_PLAN_TO_ENTERPRISE_MODAL_ID}
        title={t`Change to Organization Plan?`}
        subtitle={confirmationModalSwitchToOrganizationMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_PLAN_TO_PRO_MODAL_ID}
        title={t`Change to Pro Plan?`}
        subtitle={confirmationModalSwitchToProMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalId={CANCEL_SWITCH_BILLING_PLAN_MODAL_ID}
        title={t`Cancel plan switching?`}
        subtitle={confirmationModalCancelPlanSwitchingMessage()}
        onConfirmClick={cancelPlanSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingPlanSwitch}
      />
      <ConfirmationModal
        modalId={END_TRIAL_PERIOD_MODAL_ID}
        title={t`Start Your Subscription`}
        subtitle={t`We will activate your paid plan. Do you want to proceed?`}
        onConfirmClick={endTrialPeriod}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isEndTrialPeriodLoading}
      />
      <ConfirmationModal
        modalId={CANCEL_SWITCH_METERED_PRICE_MODAL_ID}
        title={t`Cancel metered tier switching?`}
        subtitle={t`You have scheduled a metered tier change. Do you want to cancel it?`}
        onConfirmClick={cancelMeteredSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingMeteredSwitch}
      />
    </Section>
  );
};
