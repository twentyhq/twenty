import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { SubscriptionInfoRowContainer } from '@/billing/components/SubscriptionInfoRowContainer';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { formatMonthlyPrices } from '@/billing/utils/formatMonthlyPrices';
import {
  getIntervalLabel,
  isEnterprisePlan as isEnterprisePlanFn,
  isMonthlyPlan as isMonthlyPlanFn,
  isProPlan as isProPlanFn,
  isYearlyPlan as isYearlyPlanFn,
} from '@/billing/utils/subscriptionFlags';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import {
  H2Title,
  IconArrowUp,
  IconCalendarEvent,
  IconCalendarRepeat,
  IconCircleX,
  IconTag,
  IconUsers,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  BillingPlanKey,
  type BillingPlanOutput,
  BillingProductKey,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
  useBillingBaseProductPricesQuery,
  useSwitchSubscriptionToEnterprisePlanMutation,
  useSwitchSubscriptionToYearlyIntervalMutation,
} from '~/generated-metadata/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

const SWITCH_BILLING_INTERVAL_MODAL_ID = 'switch-billing-interval-modal';

const SWITCH_BILLING_PLAN_MODAL_ID = 'switch-billing-plan-modal';

const END_TRIAL_PERIOD_MODAL_ID = 'end-trial-period-modal';

const StyledSwitchButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsBillingSubscriptionInfo = () => {
  const { t } = useLingui();

  const { openModal } = useModal();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const subscriptionStatus = useSubscriptionStatus();

  const { data: pricesData } = useBillingBaseProductPricesQuery();

  const [switchToYearlyInterval] =
    useSwitchSubscriptionToYearlyIntervalMutation();

  const [switchToEnterprisePlan] =
    useSwitchSubscriptionToEnterprisePlanMutation();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const isMonthlyPlan = isMonthlyPlanFn(currentWorkspace);

  const isYearlyPlan = isYearlyPlanFn(currentWorkspace);

  const isProPlan = isProPlanFn(currentWorkspace);

  const isEnterprisePlan = isEnterprisePlanFn(currentWorkspace);

  const isTrialPeriod = subscriptionStatus === SubscriptionStatus.Trialing;

  const canSwitchSubscription =
    subscriptionStatus !== SubscriptionStatus.PastDue;

  const { endTrialPeriod, isLoading: isEndTrialPeriodLoading } =
    useEndSubscriptionTrialPeriod();

  const planDescriptor = isProPlan
    ? { color: 'sky' as const, label: t`Pro` }
    : isEnterprisePlan
      ? { color: 'purple' as const, label: t`Organization` }
      : undefined;

  const planTag = planDescriptor ? (
    <>
      <Tag color={planDescriptor.color} text={planDescriptor.label} />
      {isTrialPeriod && <Tag color="blue" text={t`Trial`} />}
    </>
  ) : undefined;

  const intervalLabel = capitalize(getIntervalLabel(isMonthlyPlan, true));
  const { [PermissionFlagType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    usePermissionFlagMap();

  const seats =
    currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct?.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT,
    )?.quantity as number | undefined;

  const baseProductPrices = pricesData?.plans as BillingPlanOutput[];

  const formattedPrices = formatMonthlyPrices(baseProductPrices);

  const renewDate =
    currentWorkspace?.currentBillingSubscription?.currentPeriodEnd;

  const yearlyPrice =
    formattedPrices?.[
      currentWorkspace?.currentBillingSubscription?.metadata[
        'plan'
      ] as BillingPlanKey
    ]?.[SubscriptionInterval.Year];

  const enterprisePrice =
    formattedPrices?.[BillingPlanKey.ENTERPRISE]?.[
      currentWorkspace?.currentBillingSubscription?.interval as
        | SubscriptionInterval.Month
        | SubscriptionInterval.Year
    ];

  const switchInterval = async () => {
    try {
      await switchToYearlyInterval();
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
      enqueueSuccessSnackBar({
        message: t`Subscription has been switched to Yearly.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription to Yearly.`,
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
        <SubscriptionInfoRowContainer
          label={t`Plan`}
          Icon={IconTag}
          value={planTag}
        />
        <SubscriptionInfoRowContainer
          label={t`Billing interval`}
          Icon={IconCalendarEvent}
          value={intervalLabel}
        />
        {renewDate && (
          <SubscriptionInfoRowContainer
            label={t`Renewal date`}
            Icon={IconCalendarRepeat}
            value={beautifyExactDate(renewDate)}
          />
        )}
        <SubscriptionInfoRowContainer
          label={t`Seats`}
          Icon={IconUsers}
          value={seats}
        />
      </SubscriptionInfoContainer>
      <StyledSwitchButtonContainer>
        {isMonthlyPlan && (
          <Button
            Icon={IconArrowUp}
            title={t`Switch to Yearly`}
            variant="secondary"
            onClick={() => openModal(SWITCH_BILLING_INTERVAL_MODAL_ID)}
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
        modalId={SWITCH_BILLING_INTERVAL_MODAL_ID}
        title={t`Change to Yearly?`}
        subtitle={t`You will be charged $${yearlyPrice} per user per month billed annually. A prorata with your current subscription will be applied.`}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
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
