import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { SubscriptionInfoRowContainer } from '@/billing/components/SubscriptionInfoRowContainer';

import {
  H2Title,
  IconCalendarEvent,
  IconTag,
  IconUsers,
  IconArrowUp,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import {
  BillingPlanKey,
  BillingPlanOutput,
  BillingProductKey,
  SubscriptionInterval,
  SubscriptionStatus,
  useBillingBaseProductPricesQuery,
  useSwitchSubscriptionToEnterprisePlanMutation,
  useSwitchSubscriptionToYearlyIntervalMutation,
} from '~/generated/graphql';
import { useRecoilState } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Tag } from 'twenty-ui/components';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { formatMonthlyPrices } from '@/billing/utils/formatMonthlyPrices';
import { isDefined } from 'twenty-shared/utils';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const SWITCH_BILLING_INTERVAL_MODAL_ID = 'switch-billing-interval-modal';

const SWITCH_BILLING_PLAN_MODAL_ID = 'switch-billing-plan-modal';

const StyledSwitchButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsBillingSubscriptionInfo = () => {
  const { t } = useLingui();

  const { openModal } = useModal();

  const { enqueueSnackBar } = useSnackBar();

  const subscriptionStatus = useSubscriptionStatus();

  const { data: pricesData } = useBillingBaseProductPricesQuery();

  const [switchToYearlyInterval] =
    useSwitchSubscriptionToYearlyIntervalMutation();

  const [switchToEnterprisePlan] =
    useSwitchSubscriptionToEnterprisePlanMutation();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const isMonthlyPlan =
    currentWorkspace?.currentBillingSubscription?.interval ===
    SubscriptionInterval.Month;

  const isYearlyPlan =
    currentWorkspace?.currentBillingSubscription?.interval ===
    SubscriptionInterval.Year;

  const isProPlan =
    currentWorkspace?.currentBillingSubscription?.metadata['plan'] ===
    BillingPlanKey.PRO;

  const isEnterprisePlan =
    currentWorkspace?.currentBillingSubscription?.metadata['plan'] ===
    BillingPlanKey.ENTERPRISE;

  const canSwitchSubscription =
    subscriptionStatus !== SubscriptionStatus.PastDue;

  const planTag = isProPlan ? (
    <Tag color={'sky'} text={t`Pro`} />
  ) : isEnterprisePlan ? (
    <Tag color={'purple'} text={t`Organization`} />
  ) : undefined;

  const intervalLabel = isMonthlyPlan
    ? t`Monthly`
    : isYearlyPlan
      ? t`Yearly`
      : undefined;

  const seats =
    currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct?.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT,
    )?.quantity as number | undefined;

  const baseProductPrices = pricesData?.plans as BillingPlanOutput[];

  const formattedPrices = formatMonthlyPrices(baseProductPrices);

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
      enqueueSnackBar(t`Subscription has been switched to Yearly.`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error: any) {
      enqueueSnackBar(t`Error while switching subscription to Yearly.`, {
        variant: SnackBarVariant.Error,
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
      enqueueSnackBar(t`Subscription has been switched to Organization Plan.`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error: any) {
      enqueueSnackBar(
        t`Error while switching subscription to Organization Plan.`,
        {
          variant: SnackBarVariant.Error,
        },
      );
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
      </StyledSwitchButtonContainer>
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_MODAL_ID}
        title={t`Change to Yearly?`}
        subtitle={t`You will be charged $${yearlyPrice} per user per month billed annually. A prorata with your current subscription will be applied.`}
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
    </Section>
  );
};
