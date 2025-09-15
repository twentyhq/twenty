import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import {
  SubscriptionInfoHeaderRow,
  SubscriptionInfoRowContainer,
} from '@/billing/components/internal/SubscriptionInfoRowContainer';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconArrowUp,
  IconCalendarEvent,
  IconCalendarRepeat,
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
  useSwitchBillingPlanMutation,
  useSwitchSubscriptionIntervalMutation,
} from '~/generated-metadata/graphql';
import { beautifyExactDate } from '~/utils/date-utils';
import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { formatNumber } from '~/utils/format/number';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import { useNextBillingPhase } from '@/billing/hooks/useNextBillingPhase';
import { PlansTags } from '@/billing/components/internal/PlansTags';
import { useBillingWording } from '@/billing/hooks/useBillingWording';
import { SubscriptionStatus } from '~/generated/graphql';

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

  const { openModal } = useModal();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const {
    getCurrentMeteredBillingPrice,
    getCurrentPlan,
    getOppositPlan,
    isEnterprisePlan,
    isYearlyPlan,
    isMonthlyPlan,
    isProPlan,
  } = useBillingPlan();

  const {
    hasNextBillingPhase,
    getNextInterval,
    getNextPlan,
    nextPrepaidCredits,
    getNextBillingSeats,
  } = useNextBillingPhase();

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
  } = useBillingWording(currentBillingSubscription);

  const [switchSubscriptionIntervalMutation] =
    useSwitchSubscriptionIntervalMutation();

  const [switchBillingPlan] = useSwitchBillingPlanMutation();

  const [cancelSwitchBillingInterval] =
    useCancelSwitchBillingIntervalMutation();

  const [cancelSwitchBillingPlan] = useCancelSwitchBillingPlanMutation();

  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const currentMeterPrice = getCurrentMeteredBillingPrice();

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

  const switchInterval = async () => {
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
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription:
            data.switchSubscriptionInterval.currentBillingSubscription,
          billingSubscriptions:
            data?.switchSubscriptionInterval.billingSubscriptions,
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
      enqueueSuccessSnackBar({ message });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription.`,
      });
    }
  };

  const endTrialPeriodIfNeeded = async () => {
    if (currentBillingSubscription.status === SubscriptionStatus.Trialing) {
      return await endTrialPeriod();
    }
    return { success: true };
  };

  const switchPlan = async () => {
    const newPlan = getOppositPlan();
    try {
      const { success } = await endTrialPeriodIfNeeded();
      if (success === false) {
        return;
      }
      const { data } = await switchBillingPlan();
      if (isDefined(data?.switchBillingPlan.currentBillingSubscription)) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription:
            data.switchBillingPlan.currentBillingSubscription,
          billingSubscriptions: data?.switchBillingPlan.billingSubscriptions,
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
      const beautifiedRenewDate = getBeautifiedRenewDate();
      enqueueSuccessSnackBar({
        message:
          newPlan === BillingPlanKey.ENTERPRISE
            ? t`Subscription has been switched to ${newPlan} Plan.`
            : `Subscription will be switched to ${newPlan} Plan the ${beautifiedRenewDate}.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription to ${newPlan} Plan.`,
      });
    }
  };

  const cancelPlanSwitching = async () => {
    try {
      const { data } = await cancelSwitchBillingPlan();

      if (isDefined(data?.cancelSwitchBillingPlan.currentBillingSubscription)) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription:
            data?.cancelSwitchBillingPlan.currentBillingSubscription,
          billingSubscriptions:
            data?.cancelSwitchBillingPlan.billingSubscriptions,
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }

      enqueueSuccessSnackBar({
        message: t`Plan switching has been cancelled.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while cancelling plan switching.`,
      });
    }
  };

  const cancelIntervalSwitching = async () => {
    try {
      const { data } = await cancelSwitchBillingInterval();
      if (
        isDefined(data?.cancelSwitchBillingInterval.currentBillingSubscription)
      ) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription:
            data?.cancelSwitchBillingInterval.currentBillingSubscription,
          billingSubscriptions:
            data?.cancelSwitchBillingInterval.billingSubscriptions,
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
      enqueueSuccessSnackBar({
        message: t`Interval switching has been cancelled.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while cancelling interval switching.`,
      });
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
              plan={getCurrentPlan().planKey}
              isTrialPeriod={isTrialPeriod}
            />
          }
          nextValue={
            hasNextBillingPhase ? (
              <PlansTags
                plan={getNextPlan().planKey}
                isTrialPeriod={isTrialPeriod}
              />
            ) : undefined
          }
        />
        <SubscriptionInfoRowContainer
          label={t`Billing interval`}
          Icon={IconCalendarEvent}
          currentValue={getIntervalLabelAsAdjectiveCapitalize(
            getCurrentMeteredBillingPrice().recurringInterval ===
              SubscriptionInterval.Month,
          )}
          nextValue={
            hasNextBillingPhase
              ? getIntervalLabelAsAdjectiveCapitalize(
                  getNextInterval() === SubscriptionInterval.Month,
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
              hasNextBillingPhase
                ? beautifyExactDate(
                    currentBillingSubscription.phases[1].end_date * 1000,
                  )
                : undefined
            }
          />
        )}
        <SubscriptionInfoRowContainer
          label={t`Seats`}
          Icon={IconUsers}
          currentValue={seats}
          nextValue={hasNextBillingPhase ? getNextBillingSeats() : undefined}
        />
        <SubscriptionInfoRowContainer
          label={t`Credits by period`}
          Icon={IconCoins}
          currentValue={formatNumber(currentMeterPrice.tiers[0].upTo)}
          nextValue={
            hasNextBillingPhase ? formatNumber(nextPrepaidCredits()) : undefined
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
            disabled={isEndTrialPeriodLoading}
          />
        )}
        {hasNextBillingPhase &&
          getCurrentPlan().planKey !== getNextPlan().planKey && (
            <Button
              Icon={IconArrowUp}
              title={t`Cancel plan switching`}
              variant="secondary"
              onClick={() => openModal(CANCEL_SWITCH_BILLING_PLAN_MODAL_ID)}
              disabled={!canSwitchSubscription}
            />
          )}
        {hasNextBillingPhase &&
          getCurrentMeteredBillingPrice().recurringInterval !==
            getNextInterval() && (
            <Button
              Icon={IconArrowUp}
              title={t`Cancel interval switching`}
              variant="secondary"
              onClick={() => openModal(CANCEL_SWITCH_BILLING_INTERVAL_MODAL_ID)}
              disabled={!canSwitchSubscription}
            />
          )}
        {isMonthlyPlan &&
          (!hasNextBillingPhase ||
            getCurrentMeteredBillingPrice().recurringInterval ===
              getNextInterval()) && (
            <Button
              Icon={IconArrowUp}
              title={t`Switch to Yearly`}
              variant="secondary"
              onClick={() =>
                openModal(SWITCH_BILLING_INTERVAL_TO_YEARLY_MODAL_ID)
              }
              disabled={!canSwitchSubscription}
            />
          )}
        {isYearlyPlan &&
          (!hasNextBillingPhase ||
            getCurrentMeteredBillingPrice().recurringInterval ===
              getNextInterval()) && (
            <Button
              Icon={IconArrowUp}
              title={t`Switch to Monthly`}
              variant="secondary"
              onClick={() =>
                openModal(SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID)
              }
              disabled={!canSwitchSubscription}
            />
          )}
        {isProPlan &&
          (!hasNextBillingPhase ||
            getCurrentPlan().planKey === getNextPlan().planKey) && (
            <Button
              Icon={IconArrowUp}
              title={t`Switch to Organization`}
              variant="secondary"
              onClick={() =>
                openModal(SWITCH_BILLING_PLAN_TO_ENTERPRISE_MODAL_ID)
              }
              disabled={!canSwitchSubscription}
            />
          )}
        {isEnterprisePlan &&
          (!hasNextBillingPhase ||
            getCurrentPlan().planKey === getNextPlan().planKey) && (
            <Button
              Icon={IconArrowUp}
              title={t`Switch to Pro`}
              variant="secondary"
              onClick={() => openModal(SWITCH_BILLING_PLAN_TO_PRO_MODAL_ID)}
              disabled={!canSwitchSubscription}
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
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID}
        title={t`Change to Monthly?`}
        subtitle={confirmationModalSwitchToMonthlyMessage()}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_PLAN_TO_ENTERPRISE_MODAL_ID}
        title={t`Change to Organization Plan?`}
        subtitle={confirmationModalSwitchToOrganizationMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_PLAN_TO_PRO_MODAL_ID}
        title={t`Change to Pro Plan?`}
        subtitle={confirmationModalSwitchToProMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalId={CANCEL_SWITCH_BILLING_PLAN_MODAL_ID}
        title={t`Cancel plan switching?`}
        subtitle={confirmationModalCancelPlanSwitchingMessage()}
        onConfirmClick={cancelPlanSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalId={CANCEL_SWITCH_BILLING_INTERVAL_MODAL_ID}
        title={t`Cancel interval switching?`}
        subtitle={confirmationModalCancelIntervalSwitchingMessage()}
        onConfirmClick={cancelIntervalSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
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
    </Section>
  );
};
