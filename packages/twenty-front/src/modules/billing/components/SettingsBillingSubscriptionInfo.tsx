import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import {
  SubscriptionInfoHeaderRow,
  SubscriptionInfoRowContainer,
} from '@/billing/components/internal/SubscriptionInfoRowContainer';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import {
  getIntervalLabel,
  isMonthlyPlan as isMonthlyPlanFn,
  isProPlan as isProPlanFn,
  isYearlyPlan as isYearlyPlanFn,
} from '@/billing/utils/subscriptionFlags';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useSetRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
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
  SubscriptionStatus,
  useSwitchSubscriptionToEnterprisePlanMutation,
  useToggleSubscriptionIntervalMutation,
} from '~/generated-metadata/graphql';
import { beautifyExactDate } from '~/utils/date-utils';
import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { formatNumber } from '~/utils/format/number';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import { useFormatPrices } from '@/billing/hooks/useFormatPrices';
import { useNextBillingPhase } from '@/billing/hooks/useNextBillingPhase';
import { PlanTag } from '@/billing/components/internal/PlanTag';

const SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID =
  'switch-billing-interval-to-monthly-modal';

const SWITCH_BILLING_INTERVAL_TO_YEARLY_MODAL_ID =
  'switch-billing-interval-to-yearly-modal';

const SWITCH_BILLING_PLAN_MODAL_ID = 'switch-billing-plan-modal';

const END_TRIAL_PERIOD_MODAL_ID = 'end-trial-period-modal';

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

  const { getCurrentMeteredBillingPrice, getCurrentPlan } = useBillingPlan();

  const {
    hasNextBillingPhase,
    getNextInterval,
    getNextPlan,
    nextPrepaidCredits,
    getNextBillingSeats,
  } = useNextBillingPhase();

  const subscriptionStatus = useSubscriptionStatus();

  const { formatMonthlyPrices } = useFormatPrices();

  const [toggleSubscriptionIntervalMutation] =
    useToggleSubscriptionIntervalMutation();

  const [switchToEnterprisePlan] =
    useSwitchSubscriptionToEnterprisePlanMutation();

  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const currentMeterPrice = getCurrentMeteredBillingPrice();

  const isMonthlyPlan = isMonthlyPlanFn(currentWorkspace);

  const isYearlyPlan = isYearlyPlanFn(currentWorkspace);

  const isProPlan = isProPlanFn(currentWorkspace);

  const isTrialPeriod = subscriptionStatus === SubscriptionStatus.Trialing;

  const canSwitchSubscription =
    subscriptionStatus !== SubscriptionStatus.PastDue;

  const { endTrialPeriod, isLoading: isEndTrialPeriodLoading } =
    useEndSubscriptionTrialPeriod();

  const getIntervalLabelAsAdjectiveCapitalize = (isMonthlyPlan: boolean) => {
    return capitalize(getIntervalLabel(isMonthlyPlan, true));
  };
  const intervalLabel = getIntervalLabel(isMonthlyPlan);

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    usePermissionFlagMap();

  const seats = currentBillingSubscription.billingSubscriptionItems?.find(
    (item) =>
      item.billingProduct.metadata.productKey ===
      BillingProductKey.BASE_PRODUCT,
  )?.quantity as number | undefined;

  const formattedPrices = formatMonthlyPrices();

  const renewDate = currentBillingSubscription.currentPeriodEnd;

  const beautifiedRenewDate = renewDate
    ? beautifyExactDate(renewDate)
    : undefined;

  const yearlyPrice =
    formattedPrices?.[
      currentBillingSubscription.metadata['plan'] as BillingPlanKey
    ]?.[SubscriptionInterval.Year];

  const monthlyPrice =
    formattedPrices?.[
      currentBillingSubscription.metadata['plan'] as BillingPlanKey
    ]?.[SubscriptionInterval.Month];

  const enterprisePrice =
    formattedPrices?.[BillingPlanKey.ENTERPRISE]?.[
      currentBillingSubscription.interval as
        | SubscriptionInterval.Month
        | SubscriptionInterval.Year
    ];

  const switchInterval = async () => {
    try {
      await toggleSubscriptionIntervalMutation();
      const message =
        currentBillingSubscription.interval === SubscriptionInterval.Month
          ? t`Subscription has been switched to Yearly.`
          : t`Subscription will be switch to Monthly the ${beautifiedRenewDate}.`;
      if (isDefined(currentWorkspace?.currentBillingSubscription)) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription: {
            ...currentWorkspace?.currentBillingSubscription,
            interval: SubscriptionInterval.Year,
          },
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

  const switchPlan = async () => {
    try {
      await switchToEnterprisePlan();
      if (isDefined(currentWorkspace?.currentBillingSubscription)) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription: {
            ...currentWorkspace?.currentBillingSubscription,
            metadata: {
              ...currentWorkspace?.currentBillingSubscription.metadata,
              plan: BillingPlanKey.ENTERPRISE,
            },
          },
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
      enqueueSuccessSnackBar({
        message: t`Subscription has been switched to Organization Plan.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription to Organization Plan.`,
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
            <PlanTag
              plan={getCurrentPlan().planKey}
              isTrialPeriod={isTrialPeriod}
            />
          }
          nextValue={
            hasNextBillingPhase ? (
              <PlanTag
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
        {renewDate && (
          <SubscriptionInfoRowContainer
            label={t`Renewal date`}
            Icon={IconCalendarRepeat}
            currentValue={beautifyExactDate(renewDate)}
            nextValue={
              hasNextBillingPhase
                ? beautifyExactDate(
                    currentBillingSubscription.phases[1].endDate * 1000,
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
        {isMonthlyPlan && (
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
        {isYearlyPlan && (
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
        {isProPlan && (
          <Button
            Icon={IconArrowUp}
            title={t`Switch to Organization`}
            variant="secondary"
            onClick={() => openModal(SWITCH_BILLING_PLAN_MODAL_ID)}
            disabled={!canSwitchSubscription}
          />
        )}
        {isTrialPeriod && hasPermissionToEndTrialPeriod && (
          <Button
            Icon={IconCircleX}
            title={t`Subscribe Now`}
            variant="secondary"
            onClick={() => openModal(END_TRIAL_PERIOD_MODAL_ID)}
            disabled={isEndTrialPeriodLoading}
          />
        )}
      </StyledSwitchButtonContainer>
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID}
        title={t`Change to Yearly?`}
        subtitle={t`You will be charged $${yearlyPrice} per user per year billed annually. A prorata with your current subscription will be applied.`}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_TO_MONTHLY_MODAL_ID}
        title={t`Change to Monthly?`}
        subtitle={t`You will be charged $${monthlyPrice} per user per month billed monthly. The change will be applied the ${beautifiedRenewDate}.`}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_PLAN_MODAL_ID}
        title={t`Change to Organization Plan?`}
        subtitle={
          isYearlyPlan
            ? t`You will be charged $${enterprisePrice} per user per month billed annually.`
            : t`You will be charged $${enterprisePrice} per user per month.`
        }
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
      />
      <ConfirmationModal
        modalId={END_TRIAL_PERIOD_MODAL_ID}
        title={t`Start Your Subscription`}
        subtitle={t`We will activate your paid plan. Do you want to proceed?`}
        onConfirmClick={endTrialPeriod}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
        loading={isEndTrialPeriodLoading}
      />
    </Section>
  );
};
