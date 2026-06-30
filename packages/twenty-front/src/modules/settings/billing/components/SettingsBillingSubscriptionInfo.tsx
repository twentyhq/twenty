import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';

import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import {
  StyledSettingsBillingCard,
  StyledSettingsBillingCardGridBody,
  StyledSettingsBillingCardHeader,
} from '@/settings/billing/components/internal/SettingsBillingCard';
import { SettingsTextLink } from '@/settings/components/SettingsTextLink';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingSubscriptionCost } from '@/settings/billing/hooks/useBillingSubscriptionCost';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { WorkspaceMemberAvatarStack } from '@/workspace-member/components/WorkspaceMemberAvatarStack';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconCalendarDue,
  IconClockPlay,
  IconCircleX,
  IconCoins,
  IconCreditCard,
  IconSum,
  IconUserCircle,
  IconUsers,
  type TablerIconsProps,
} from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';
import {
  BillingPlanKey,
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

type BillingStatusTone = 'blue' | 'gray' | 'orange' | 'red';

const StyledPlanHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledPlanLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledStatusPill = styled.span<{ tone: BillingStatusTone }>`
  align-items: center;
  background-color: ${({ tone }) =>
    tone === 'red'
      ? themeCssVariables.color.red4
      : tone === 'orange'
        ? themeCssVariables.color.orange4
        : tone === 'gray'
          ? themeCssVariables.color.gray4
          : themeCssVariables.color.blue4};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ tone }) =>
    tone === 'red'
      ? themeCssVariables.color.red11
      : tone === 'orange'
        ? themeCssVariables.color.orange11
        : tone === 'gray'
          ? themeCssVariables.color.gray11
          : themeCssVariables.accent.accent11};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 22px;
  padding: 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledStatusDot = styled.span<{ tone: BillingStatusTone }>`
  background-color: currentColor;
  border-radius: 50%;
  height: 4px;
  width: 4px;
`;

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledBillingFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledBillingFieldListWithDivider = styled(StyledBillingFieldList)`
  border-left: 1px solid ${themeCssVariables.background.transparent.light};
  padding-left: ${themeCssVariables.spacing[6]};

  @media (max-width: 640px) {
    border-left: 0;
    border-top: 1px solid ${themeCssVariables.background.transparent.light};
    padding-left: 0;
    padding-top: ${themeCssVariables.spacing[4]};
  }
`;

const StyledBillingFieldRow = styled.div`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 24px;
`;

const StyledBillingFieldLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledBillingFieldLabelText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBillingFieldValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 0;
`;

const StyledBillingIntervalValue = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledBillingIntervalSeparator = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledSecondaryText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  margin-left: ${themeCssVariables.spacing[1]};
`;

const BillingFieldRow = ({
  Icon,
  label,
  children,
}: {
  Icon: (props: TablerIconsProps) => ReactNode;
  label: string;
  children: ReactNode;
}) => {
  const theme = useTheme();

  return (
    <StyledBillingFieldRow>
      <StyledBillingFieldLabel>
        <Icon size={16} stroke={theme.icon.stroke.sm} />
        <StyledBillingFieldLabelText>{label}</StyledBillingFieldLabelText>
      </StyledBillingFieldLabel>
      <StyledBillingFieldValue>{children}</StyledBillingFieldValue>
    </StyledBillingFieldRow>
  );
};

export const SettingsBillingSubscriptionInfo = ({
  currentWorkspace,
  currentBillingSubscription,
  onUpdatePayment,
  isUpdatePaymentDisabled,
}: {
  currentWorkspace: CurrentWorkspace;
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
  onUpdatePayment: () => void;
  isUpdatePaymentDisabled: boolean;
}) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const { openModal } = useModal();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const { currentResourceCreditBillingPrice } = useCurrentResourceCredit();

  const { currentPlan, oppositPlan } = useCurrentPlan();
  const { isEnterprisePlan, isYearlyPlan, isMonthlyPlan, isProPlan } =
    useCurrentBillingFlags();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const { nextPlan } = useNextPlan();
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

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const isTrialPeriod = subscriptionStatus === SubscriptionStatus.Trialing;
  const shouldUpdatePayment =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;

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
        return { label: t`Trial`, tone: 'blue' as const };
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
  const totalIntervalSubtitle =
    currentInterval === SubscriptionInterval.Month
      ? t`/month`
      : t`/month billed yearly`;

  const canDisplaySwitchToYearlyAction =
    !isCancellationScheduled &&
    isMonthlyPlan &&
    (!nextInterval || currentInterval === nextInterval);
  const canSwitchToOrganizationPlan =
    isProPlan && (!nextPlan || currentPlan.planKey === nextPlan.planKey);

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

  const endTrialPeriodIfNeeded = async () => {
    if (currentBillingSubscription.status === SubscriptionStatus.Trialing) {
      return await endTrialPeriod();
    }
    return { success: true };
  };

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
    shouldEndTrialPeriod = false,
  }: {
    action: () => Promise<void>;
    getErrorMessage: () => string;
    getSuccessMessage: () => string;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    shouldEndTrialPeriod?: boolean;
  }) => {
    if (isAnyActionLoading || isLoading) return;

    setIsLoading(true);
    try {
      if (shouldEndTrialPeriod) {
        const { success } = await endTrialPeriodIfNeeded();
        if (success === false) {
          return;
        }
      }

      await action();

      enqueueSuccessSnackBar({ message: getSuccessMessage() });
    } catch {
      enqueueErrorSnackBar({
        message: getErrorMessage(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchInterval = async () => {
    await runBillingAction({
      action: async () => {
        const { data } = await switchSubscriptionIntervalMutation();

        if (
          isDefined(data?.switchSubscriptionInterval.currentBillingSubscription)
        ) {
          applyBillingUpdate(data.switchSubscriptionInterval);
        }
      },
      getErrorMessage: () => t`Error while switching subscription.`,
      getSuccessMessage: () => {
        const beautifiedRenewDate = getBeautifiedRenewDate();
        const isCurrentMonth =
          currentBillingSubscription.interval === SubscriptionInterval.Month;

        return isCurrentMonth
          ? t`Subscription has been switched to Yearly.`
          : t`Subscription will be switch to Monthly the ${beautifiedRenewDate}.`;
      },
      isLoading: isSwitchingInterval,
      setIsLoading: setIsSwitchingInterval,
      shouldEndTrialPeriod: true,
    });
  };

  const switchPlan = async () => {
    await runBillingAction({
      action: async () => {
        const { data } = await switchBillingPlan();
        if (isDefined(data?.switchBillingPlan.currentBillingSubscription)) {
          applyBillingUpdate(data.switchBillingPlan);
        }
      },
      getErrorMessage: () =>
        t`Error while switching subscription to ${oppositPlan} Plan.`,
      getSuccessMessage: () => {
        const beautifiedRenewDate = getBeautifiedRenewDate();

        return oppositPlan === BillingPlanKey.ENTERPRISE
          ? t`Subscription has been switched to ${oppositPlan} Plan.`
          : t`Subscription will be switched to ${oppositPlan} Plan the ${beautifiedRenewDate}.`;
      },
      isLoading: isSwitchingPlan,
      setIsLoading: setIsSwitchingPlan,
      shouldEndTrialPeriod: true,
    });
  };

  const cancelPlanSwitching = async () => {
    await runBillingAction({
      action: async () => {
        const { data } = await cancelSwitchBillingPlan();

        if (
          isDefined(data?.cancelSwitchBillingPlan.currentBillingSubscription)
        ) {
          applyBillingUpdate(data.cancelSwitchBillingPlan);
        }
      },
      getErrorMessage: () => t`Error while cancelling plan switching.`,
      getSuccessMessage: () => t`Plan switching has been cancelled.`,
      isLoading: isCancellingPlanSwitch,
      setIsLoading: setIsCancellingPlanSwitch,
    });
  };

  const cancelIntervalSwitching = async () => {
    await runBillingAction({
      action: async () => {
        const { data } = await cancelSwitchBillingInterval();
        if (
          isDefined(
            data?.cancelSwitchBillingInterval.currentBillingSubscription,
          )
        ) {
          applyBillingUpdate(data.cancelSwitchBillingInterval);
        }
      },
      getErrorMessage: () => t`Error while cancelling interval switching.`,
      getSuccessMessage: () => t`Interval switching has been cancelled.`,
      isLoading: isCancellingIntervalSwitch,
      setIsLoading: setIsCancellingIntervalSwitch,
    });
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
    <Section>
      <H2Title title={t`Subscription`} description={subscriptionDescription} />
      <StyledSettingsBillingCard>
        <StyledSettingsBillingCardHeader>
          <StyledPlanHeader>
            <StyledPlanLabel>{planLabel}</StyledPlanLabel>
            <StyledStatusPill tone={statusDescriptor.tone}>
              <StyledStatusDot tone={statusDescriptor.tone} />
              {statusDescriptor.label}
            </StyledStatusPill>
          </StyledPlanHeader>
          <StyledHeaderActions>
            {isCancellationScheduled ? (
              <Button
                Icon={IconCreditCard}
                title={t`Manage billing`}
                variant="primary"
                accent="blue"
                size="small"
                onClick={onUpdatePayment}
                disabled={isUpdatePaymentDisabled}
              />
            ) : shouldUpdatePayment ? (
              <Button
                Icon={IconArrowUp}
                title={t`Update payment`}
                variant="primary"
                accent="blue"
                size="small"
                onClick={onUpdatePayment}
                disabled={isUpdatePaymentDisabled}
              />
            ) : (
              <>
                {nextInterval && currentInterval !== nextInterval && (
                  <Button
                    Icon={IconCircleX}
                    title={t`Cancel interval switching`}
                    variant="secondary"
                    size="small"
                    onClick={() =>
                      openModal(BILLING_MODAL_IDS.cancelSwitchBillingInterval)
                    }
                    disabled={!canSwitchSubscription || isAnyActionLoading}
                  />
                )}
                {isYearlyPlan &&
                  (!nextInterval || currentInterval === nextInterval) && (
                    <Button
                      Icon={IconArrowDown}
                      title={t`Switch to Monthly`}
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        openModal(
                          BILLING_MODAL_IDS.switchBillingIntervalToMonthly,
                        )
                      }
                      disabled={!canSwitchSubscription || isAnyActionLoading}
                    />
                  )}
                {canSwitchToOrganizationPlan && (
                  <Button
                    Icon={IconArrowUp}
                    title={
                      isTrialPeriod
                        ? t`Switch to Organization`
                        : t`Upgrade to Organization`
                    }
                    variant={isTrialPeriod ? 'secondary' : 'primary'}
                    accent={isTrialPeriod ? 'default' : 'blue'}
                    size="small"
                    onClick={() =>
                      openModal(BILLING_MODAL_IDS.switchBillingPlanToEnterprise)
                    }
                    disabled={!canSwitchSubscription || isAnyActionLoading}
                  />
                )}
                {isTrialPeriod && hasPermissionToEndTrialPeriod && (
                  <Button
                    Icon={IconArrowUp}
                    title={t`Subscribe Now`}
                    variant="primary"
                    accent="blue"
                    size="small"
                    onClick={() => openModal(BILLING_MODAL_IDS.endTrialPeriod)}
                    disabled={isEndTrialPeriodLoading || isAnyActionLoading}
                  />
                )}
                {isEnterprisePlan &&
                  (!nextPlan || currentPlan.planKey === nextPlan.planKey) && (
                    <Button
                      Icon={IconArrowDown}
                      title={t`Switch to Pro`}
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        openModal(BILLING_MODAL_IDS.switchBillingPlanToPro)
                      }
                      disabled={!canSwitchSubscription || isAnyActionLoading}
                    />
                  )}
                {nextPlan && currentPlan.planKey !== nextPlan.planKey && (
                  <Button
                    Icon={IconCircleX}
                    title={t`Cancel plan switching`}
                    variant="secondary"
                    size="small"
                    onClick={() =>
                      openModal(BILLING_MODAL_IDS.cancelSwitchBillingPlan)
                    }
                    disabled={!canSwitchSubscription || isAnyActionLoading}
                  />
                )}
                {nextResourceCreditPrice &&
                  currentCreditsByPeriod !== nextCreditsByPeriod && (
                    <Button
                      Icon={IconCircleX}
                      title={t`Cancel credit pack switching`}
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        openModal(BILLING_MODAL_IDS.cancelSwitchMeteredPrice)
                      }
                      disabled={!canSwitchSubscription || isAnyActionLoading}
                    />
                  )}
              </>
            )}
          </StyledHeaderActions>
        </StyledSettingsBillingCardHeader>
        <StyledSettingsBillingCardGridBody>
          <StyledBillingFieldList>
            <BillingFieldRow label={t`Members`} Icon={IconUserCircle}>
              <WorkspaceMemberAvatarStack
                workspaceMembers={currentWorkspaceMembers}
                totalWorkspaceMembersCount={
                  currentWorkspace.workspaceMembersCount
                }
                defaultAvatarName={t`Workspace member`}
                fallback={isDefined(seats) ? formatNumber(seats) : undefined}
              />
            </BillingFieldRow>
            <BillingFieldRow label={t`Billing interval`} Icon={IconClockPlay}>
              <StyledBillingIntervalValue>
                {currentIntervalLabel}
                {canDisplaySwitchToYearlyAction && (
                  <>
                    <StyledBillingIntervalSeparator>
                      ·
                    </StyledBillingIntervalSeparator>
                    <SettingsTextLink
                      variant="secondary"
                      title={t`Switch to yearly`}
                      onClick={() =>
                        openModal(
                          BILLING_MODAL_IDS.switchBillingIntervalToYearly,
                        )
                      }
                      disabled={!canSwitchSubscription || isAnyActionLoading}
                    >
                      {t`Switch to yearly`}
                    </SettingsTextLink>
                  </>
                )}
              </StyledBillingIntervalValue>
            </BillingFieldRow>
            {isDefined(displayedSubscriptionDate) && (
              <BillingFieldRow
                label={subscriptionDateLabel}
                Icon={IconCalendarDue}
              >
                {displayedSubscriptionDate}
              </BillingFieldRow>
            )}
          </StyledBillingFieldList>
          <StyledBillingFieldListWithDivider>
            <BillingFieldRow label={t`Billed seats`} Icon={IconUsers}>
              {seatsSubtotalValue}
              {seatsSubtotalDetails && (
                <StyledSecondaryText>
                  {seatsSubtotalDetails}
                </StyledSecondaryText>
              )}
            </BillingFieldRow>
            <BillingFieldRow label={t`Credits`} Icon={IconCoins}>
              {creditsSubtotalValue}
              {creditsSubtotalDetails && (
                <StyledSecondaryText>
                  {creditsSubtotalDetails}
                </StyledSecondaryText>
              )}
            </BillingFieldRow>
            <BillingFieldRow label={t`Total`} Icon={IconSum}>
              {isDefined(totalDisplay) ? `$${totalDisplay}` : '-'}
              {isDefined(totalDisplay) && (
                <StyledSecondaryText>
                  {totalIntervalSubtitle}
                </StyledSecondaryText>
              )}
            </BillingFieldRow>
          </StyledBillingFieldListWithDivider>
        </StyledSettingsBillingCardGridBody>
      </StyledSettingsBillingCard>
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToYearly}
        title={t`Change to Yearly?`}
        subtitle={confirmationModalSwitchToYearlyMessage()}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent={'blue'}
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToMonthly}
        title={t`Change to Monthly?`}
        subtitle={confirmationModalSwitchToMonthlyMessage()}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchBillingInterval}
        title={t`Cancel interval switching?`}
        subtitle={confirmationModalCancelIntervalSwitchingMessage()}
        onConfirmClick={cancelIntervalSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingIntervalSwitch}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToEnterprise}
        title={t`Change to Organization Plan?`}
        subtitle={confirmationModalSwitchToOrganizationMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToPro}
        title={t`Change to Pro Plan?`}
        subtitle={confirmationModalSwitchToProMessage()}
        onConfirmClick={switchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchBillingPlan}
        title={t`Cancel plan switching?`}
        subtitle={confirmationModalCancelPlanSwitchingMessage()}
        onConfirmClick={cancelPlanSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingPlanSwitch}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.endTrialPeriod}
        title={t`Start Your Subscription`}
        subtitle={startSubscriptionSubtitle}
        onConfirmClick={endTrialPeriod}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isEndTrialPeriodLoading}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchMeteredPrice}
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
