import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingMonthlyCreditsSection } from '@/billing/components/SettingsBillingMonthlyCreditsSection';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconCalendarEvent,
  IconCircleX,
  IconCreditCard,
  IconTag,
  IconUsers,
  IconArrowUp,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  BillingPlanKey,
  BillingPlanOutput,
  BillingProductKey,
  SubscriptionInterval,
  SubscriptionStatus,
  useBillingBaseProductPricesQuery,
  useBillingPortalSessionQuery,
  useSwitchSubscriptionToEnterprisePlanMutation,
  useSwitchSubscriptionToYearlyIntervalMutation,
} from '~/generated/graphql';
import styled from '@emotion/styled';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { SubscriptionInfoRowContainer } from '@/billing/components/SubscriptionInfoRowContainer';
import { Tag } from 'twenty-ui/components';
import { formatPrices } from '@/billing/utils/formatPrices';

const SWITCH_BILLING_INTERVAL_MODAL_ID = 'switch-billing-interval-modal';
const SWITCH_BILLING_PLAN_MODAL_ID = 'switch-billing-plan-modal';

const StyledSwitchButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsBilling = () => {
  const { t } = useLingui();

  const { redirect } = useRedirect();

  const { enqueueSnackBar } = useSnackBar();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const subscriptions = currentWorkspace?.billingSubscriptions;

  const hasSubscriptions = (subscriptions?.length ?? 0) > 0;

  const subscriptionStatus = useSubscriptionStatus();

  const { data: pricesData } = useBillingBaseProductPricesQuery();

  const hasNotCanceledCurrentSubscription =
    isDefined(subscriptionStatus) &&
    subscriptionStatus !== SubscriptionStatus.Canceled;

  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const [switchToYearlyInterval] =
    useSwitchSubscriptionToYearlyIntervalMutation();

  const [switchToEnterprisePlan] =
    useSwitchSubscriptionToEnterprisePlanMutation();

  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
    skip: !hasSubscriptions,
  });

  const billingPortalButtonDisabled =
    loading || !isDefined(data) || !isDefined(data.billingPortalSession.url);

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  const { openModal } = useModal();

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

  const formattedPrices = formatPrices(baseProductPrices, seats);

  const yearlyPrice =
    formattedPrices?.[
      currentWorkspace?.currentBillingSubscription?.metadata[
        'plan'
      ] as BillingPlanKey
    ][SubscriptionInterval.Year];

  const enterprisePrice =
    formattedPrices?.[BillingPlanKey.ENTERPRISE][
      currentWorkspace?.currentBillingSubscription?.interval as
        | SubscriptionInterval.Month
        | SubscriptionInterval.Year
    ];

  return (
    <SubMenuTopBarContainer
      title={t`Billing`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Billing</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Subscription`}
            description={t`About my subscription`}
          />
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
                disabled={!hasNotCanceledCurrentSubscription}
              />
            )}
            {isProPlan && (
              <Button
                Icon={IconArrowUp}
                title={t`Switch to Organization`}
                variant="secondary"
                onClick={() => openModal(SWITCH_BILLING_PLAN_MODAL_ID)}
                disabled={!hasNotCanceledCurrentSubscription}
              />
            )}
          </StyledSwitchButtonContainer>
        </Section>
        {hasNotCanceledCurrentSubscription && (
          <SettingsBillingMonthlyCreditsSection />
        )}
        <Section>
          <H2Title
            title={t`Manage billing information`}
            description={t`Edit payment method, see your invoices and more`}
          />
          <Button
            Icon={IconCreditCard}
            title={t`View billing details`}
            variant="secondary"
            onClick={openBillingPortal}
            disabled={billingPortalButtonDisabled}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Cancel your subscription`}
            description={t`Your workspace will be disabled`}
          />
          <Button
            Icon={IconCircleX}
            title={t`Cancel Plan`}
            variant="secondary"
            accent="danger"
            onClick={openBillingPortal}
            disabled={
              billingPortalButtonDisabled || !hasNotCanceledCurrentSubscription
            }
          />
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_MODAL_ID}
        title={t`Change to Yearly?`}
        subtitle={t`You will be billed ${yearlyPrice}$ per user per year. A prorata with your current subscription will be applied`}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
      />
      <ConfirmationModal
        modalId={SWITCH_BILLING_PLAN_MODAL_ID}
        title={t`Change to Organization Plan?`}
        subtitle={t`You will be billed ${enterprisePrice}$ per user per month.`}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
      />
    </SubMenuTopBarContainer>
  );
};
