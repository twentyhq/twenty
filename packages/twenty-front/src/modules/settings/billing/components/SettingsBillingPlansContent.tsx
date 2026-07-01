import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { AnimatedFormattedNumber } from '@/settings/billing/components/internal/AnimatedFormattedNumber';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { SETTINGS_BILLING_PLAN_COMPARISON_ROWS } from '@/settings/billing/constants/SettingsBillingPlanComparisonRows';
import { SETTINGS_BILLING_PLAN_TIER_IDS } from '@/settings/billing/constants/SettingsBillingPlanTierIds';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSwitchBillingPlan } from '@/settings/billing/hooks/useSwitchBillingPlan';
import {
  type SettingsBillingPlanComparisonCell,
  type SettingsBillingPlanComparisonRow,
  type SettingsBillingPlanPrices,
  type SettingsBillingPlanTierId,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { resolveSettingsBillingPlanPrices } from '@/settings/billing/utils/resolveSettingsBillingPlanPrices';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { Fragment, type JSX, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconArrowUp,
  IconCheck,
  type IconComponent,
  IconArrowDown,
  IconX,
} from 'twenty-ui/icon';
import {
  Button,
  SegmentedControl,
  type ButtonAccent,
  type ButtonVariant,
  type SegmentedControlOption,
} from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  BillingPlanKey,
  BillingPortalSessionDocument,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

type SettingsBillingPlansTableProps = {
  billingPeriod: SubscriptionInterval.Month | SubscriptionInterval.Year;
  onBillingPeriodChange: (
    billingPeriod: SubscriptionInterval.Month | SubscriptionInterval.Year,
  ) => void;
  planActions: Record<SettingsBillingPlanTierId, SettingsBillingPlanAction>;
  planPrices: SettingsBillingPlanPrices;
};

type SettingsBillingPlanAction = {
  accent?: ButtonAccent;
  disabled?: boolean;
  Icon?: IconComponent;
  isLoading?: boolean;
  onClick?: () => void;
  title: string;
  variant: ButtonVariant;
};

const PLAN_KEY_BY_TIER_ID = {
  organization: BillingPlanKey.ENTERPRISE,
  pro: BillingPlanKey.PRO,
} satisfies Record<SettingsBillingPlanTierId, BillingPlanKey>;

const STICKY_HEADER_TOP_OFFSET = themeCssVariables.spacing[6];

const StyledContentContainer = styled.div`
  max-width: 694px;
  width: 100%;
`;

const StyledStickyHeaderContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  margin-top: calc(${STICKY_HEADER_TOP_OFFSET} * -1);
  padding-top: ${STICKY_HEADER_TOP_OFFSET};
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 2;
`;

const StyledComparisonTable = styled.div`
  background: transparent;
  border: 0;
  border-radius: 0;
  display: grid;
  overflow: visible;
  row-gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledComparisonHeaderGrid = styled.div`
  background: ${themeCssVariables.border.color.medium};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: none;
  box-sizing: border-box;
  column-gap: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: clip;
  row-gap: 1px;
  width: 100%;
`;

const StyledComparisonBodyGrid = styled.div`
  background: ${themeCssVariables.border.color.medium};
  border-radius: 0;
  column-gap: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: clip;
  row-gap: 1px;
  width: 100%;
`;

const StyledHeaderCell = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  justify-content: space-between;
  min-height: 104px;
  min-width: 0;
  overflow: clip;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  width: 100%;
`;

const StyledPlanTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  min-height: 20px;
  width: 100%;
`;

const StyledComparisonTitle = styled(StyledPlanTitle)`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledPlanSubtitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.6;
`;

const StyledPriceLine = styled.div`
  align-items: baseline;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledPrice = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.2;
`;

const StyledPriceSuffix = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

const StyledFeatureCell = styled.div<{ isLabel?: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  color: ${({ isLabel }) =>
    isLabel
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
  min-height: 40px;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledCategoryCell = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  grid-column: 1 / -1;
  line-height: 1.4;
  min-height: 40px;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledCellText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBooleanIcon = styled.div<{ value: 'yes' | 'dash' }>`
  color: ${({ value }) =>
    value === 'yes'
      ? themeCssVariables.accent.accent9
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledActionSlot = styled.div`
  min-width: 0;

  > * {
    max-width: 100%;
  }
`;

const getCurrentPlanKey = (plan: unknown): BillingPlanKey | undefined => {
  if (plan === BillingPlanKey.PRO || plan === BillingPlanKey.ENTERPRISE) {
    return plan;
  }

  return undefined;
};

const SettingsBillingPlansTable = ({
  billingPeriod,
  onBillingPeriodChange,
  planActions,
  planPrices,
}: SettingsBillingPlansTableProps) => {
  const { i18n, t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const formatAnimatedPrice = (value: number) =>
    formatNumber(Math.max(0, value));
  const billingPeriodOptions = [
    {
      label: t`Annual`,
      value: SubscriptionInterval.Year,
    },
    {
      label: t`Monthly`,
      value: SubscriptionInterval.Month,
    },
  ] satisfies SegmentedControlOption<
    SubscriptionInterval.Month | SubscriptionInterval.Year
  >[];

  const renderCell = (cell: SettingsBillingPlanComparisonCell) => {
    if (cell.kind === 'yes') {
      const label = isDefined(cell.label) ? i18n._(cell.label) : t`Included`;

      return (
        <StyledBooleanIcon aria-label={label} role="img" value="yes">
          <IconCheck size={themeCssVariables.icon.size.sm} />
        </StyledBooleanIcon>
      );
    }

    if (cell.kind === 'dash') {
      return (
        <StyledBooleanIcon aria-label={t`Not included`} role="img" value="dash">
          <IconX size={themeCssVariables.icon.size.sm} />
        </StyledBooleanIcon>
      );
    }

    return <StyledCellText>{i18n._(cell.text)}</StyledCellText>;
  };

  const renderRow = (
    row: SettingsBillingPlanComparisonRow,
    rowIndex: number,
  ) => {
    if (row.type === 'category') {
      return (
        <StyledCategoryCell key={`category-${rowIndex}`}>
          <StyledCellText>{i18n._(row.title)}</StyledCellText>
        </StyledCategoryCell>
      );
    }

    return (
      <Fragment key={`row-${rowIndex}`}>
        <StyledFeatureCell key={`feature-${rowIndex}`} isLabel>
          <StyledCellText>{i18n._(row.featureLabel)}</StyledCellText>
        </StyledFeatureCell>
        {SETTINGS_BILLING_PLAN_TIER_IDS.map((tierId) => (
          <StyledFeatureCell key={`${tierId}-${rowIndex}`}>
            {renderCell(row.tiers[tierId])}
          </StyledFeatureCell>
        ))}
      </Fragment>
    );
  };

  return (
    <StyledContentContainer>
      <StyledComparisonTable>
        <StyledStickyHeaderContainer>
          <StyledComparisonHeaderGrid>
            <StyledHeaderCell>
              <StyledHeaderText>
                <StyledComparisonTitle>{t`Compare plans`}</StyledComparisonTitle>
                <StyledPlanSubtitle>
                  {billingPeriod === SubscriptionInterval.Year
                    ? t`Save 25% when billed yearly`
                    : t`Billed monthly`}
                </StyledPlanSubtitle>
              </StyledHeaderText>
              <SegmentedControl
                ariaLabel={t`Billing period`}
                onChange={onBillingPeriodChange}
                options={billingPeriodOptions}
                value={billingPeriod}
              />
            </StyledHeaderCell>

            {SETTINGS_BILLING_PLAN_TIER_IDS.map((tierId) => {
              const action = planActions[tierId];
              const price = planPrices[tierId][billingPeriod];

              return (
                <StyledHeaderCell key={tierId}>
                  <StyledHeaderText>
                    <StyledPlanTitle>
                      {tierId === 'pro' ? t`Pro plan` : t`Organization`}
                    </StyledPlanTitle>
                    <StyledPriceLine>
                      <StyledPrice>
                        $
                        <AnimatedFormattedNumber
                          value={price}
                          formatValue={formatAnimatedPrice}
                        />
                      </StyledPrice>
                      <StyledPriceSuffix>{t`/user per month`}</StyledPriceSuffix>
                    </StyledPriceLine>
                  </StyledHeaderText>
                  <StyledActionSlot>
                    <Button
                      Icon={action.Icon}
                      title={action.title}
                      variant={action.variant}
                      accent={action.accent ?? 'default'}
                      size="small"
                      disabled={action.disabled}
                      isLoading={action.isLoading}
                      onClick={action.onClick}
                    />
                  </StyledActionSlot>
                </StyledHeaderCell>
              );
            })}
          </StyledComparisonHeaderGrid>
        </StyledStickyHeaderContainer>

        <StyledComparisonBodyGrid>
          {SETTINGS_BILLING_PLAN_COMPARISON_ROWS.map(renderRow)}
        </StyledComparisonBodyGrid>
      </StyledComparisonTable>
    </StyledContentContainer>
  );
};

const useCloudPlanActions = (
  currentPlanKey: BillingPlanKey,
): Record<SettingsBillingPlanTierId, SettingsBillingPlanAction> & {
  modals: JSX.Element;
} => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscriptionStatus = useSubscriptionStatus();
  const { redirect } = useRedirect();
  const { openModal } = useModal();
  const { nextPlan } = useNextPlan();
  const {
    confirmationModalSwitchToOrganizationMessage,
    confirmationModalSwitchToProMessage,
  } = useBillingWording();
  const permissionMap = usePermissionFlagMap();

  const targetPlanKey =
    currentPlanKey === BillingPlanKey.PRO
      ? BillingPlanKey.ENTERPRISE
      : BillingPlanKey.PRO;
  const { isSwitchingPlan, switchBillingPlan } = useSwitchBillingPlan({
    targetPlanKey,
  });

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const hasSubscriptions =
    (currentWorkspace?.billingSubscriptions.length ?? 0) > 0;
  const hasPermissionToManageBilling =
    permissionMap[PermissionFlagType.BILLING] ?? false;

  const { data, loading: isBillingPortalSessionLoading } = useQuery(
    BillingPortalSessionDocument,
    {
      variables: {
        returnUrlPath: getSettingsPath(SettingsPath.BillingPlans),
      },
      skip: !hasSubscriptions,
    },
  );

  const openBillingPortal = () => {
    if (isDefined(data?.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  const hasBillingPortalSession = isDefined(data?.billingPortalSession.url);
  const shouldUpdatePayment =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;
  const isSubscriptionCanceled =
    currentBillingSubscription?.status === SubscriptionStatus.Canceled ||
    subscriptionStatus === SubscriptionStatus.Canceled;
  const isCancellationScheduled =
    currentBillingSubscription?.status !== SubscriptionStatus.Canceled &&
    isDefined(currentBillingSubscription?.cancelAt);
  const canSwitchSubscription =
    isDefined(currentBillingSubscription) &&
    !shouldUpdatePayment &&
    !isSubscriptionCanceled &&
    !isCancellationScheduled &&
    hasPermissionToManageBilling;

  const createBillingPortalAction = (
    title: string,
  ): SettingsBillingPlanAction => {
    return {
      disabled: isBillingPortalSessionLoading || !hasBillingPortalSession,
      onClick: openBillingPortal,
      title,
      variant: 'secondary',
    };
  };

  const createManageBillingAction = () =>
    createBillingPortalAction(t`Manage billing`);

  const createUpdatePaymentAction = () =>
    createBillingPortalAction(t`Update payment`);

  const getActionForTier = (
    tierId: SettingsBillingPlanTierId,
  ): SettingsBillingPlanAction => {
    const planKey = PLAN_KEY_BY_TIER_ID[tierId];

    if (isSubscriptionCanceled) {
      return createManageBillingAction();
    }

    if (currentPlanKey === planKey) {
      return {
        disabled: true,
        Icon: IconCheck,
        title: t`Current`,
        variant: 'secondary',
      };
    }

    if (nextPlan?.planKey === planKey) {
      return {
        disabled: true,
        title: t`Scheduled`,
        variant: 'secondary',
      };
    }

    if (shouldUpdatePayment) {
      return createUpdatePaymentAction();
    }

    if (isCancellationScheduled) {
      return createManageBillingAction();
    }

    if (!canSwitchSubscription) {
      return {
        disabled: true,
        title: hasPermissionToManageBilling ? t`Unavailable` : t`Contact admin`,
        variant: 'secondary',
      };
    }

    const isSwitchingToOrganizationPlan = planKey === BillingPlanKey.ENTERPRISE;

    return {
      disabled: isSwitchingPlan,
      Icon: isSwitchingToOrganizationPlan ? IconArrowUp : IconArrowDown,
      isLoading: isSwitchingPlan,
      onClick: () =>
        openModal(
          isSwitchingToOrganizationPlan
            ? BILLING_MODAL_IDS.switchBillingPlanToEnterprise
            : BILLING_MODAL_IDS.switchBillingPlanToPro,
        ),
      title: isSwitchingToOrganizationPlan ? t`Upgrade` : t`Switch to Pro`,
      variant: isSwitchingToOrganizationPlan ? 'primary' : 'secondary',
      accent: isSwitchingToOrganizationPlan ? 'blue' : 'default',
    };
  };

  return {
    organization: getActionForTier('organization'),
    pro: getActionForTier('pro'),
    modals: (
      <>
        <ConfirmationModal
          modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToEnterprise}
          title={t`Change to Organization Plan?`}
          subtitle={confirmationModalSwitchToOrganizationMessage()}
          onConfirmClick={switchBillingPlan}
          confirmButtonText={t`Confirm`}
          confirmButtonAccent="blue"
          loading={isSwitchingPlan}
        />
        <ConfirmationModal
          modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToPro}
          title={t`Change to Pro Plan?`}
          subtitle={confirmationModalSwitchToProMessage()}
          onConfirmClick={switchBillingPlan}
          confirmButtonText={t`Confirm`}
          confirmButtonAccent="blue"
          loading={isSwitchingPlan}
        />
      </>
    ),
  };
};

const useCloudFallbackPlanActions = () => {
  const { t } = useLingui();
  const billing = useAtomStateValue(billingState);
  const { redirect } = useRedirect();

  const fallbackUrl = billing?.billingUrl;
  const canOpenFallbackUrl = isDefined(fallbackUrl) && fallbackUrl.length > 0;

  return {
    organization: {
      accent: 'blue' as const,
      disabled: !canOpenFallbackUrl,
      onClick: canOpenFallbackUrl ? () => redirect(fallbackUrl) : undefined,
      title: t`Choose plan`,
      variant: 'primary' as const,
    },
    pro: {
      accent: 'blue' as const,
      disabled: !canOpenFallbackUrl,
      onClick: canOpenFallbackUrl ? () => redirect(fallbackUrl) : undefined,
      title: t`Choose plan`,
      variant: 'primary' as const,
    },
  };
};

const SettingsBillingPlansCloudFallbackContent = ({
  billingPeriod,
  onBillingPeriodChange,
  planPrices,
}: {
  billingPeriod: SubscriptionInterval.Month | SubscriptionInterval.Year;
  onBillingPeriodChange: (
    billingPeriod: SubscriptionInterval.Month | SubscriptionInterval.Year,
  ) => void;
  planPrices: SettingsBillingPlansTableProps['planPrices'];
}) => {
  const planActions = useCloudFallbackPlanActions();

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlansTable
        billingPeriod={billingPeriod}
        onBillingPeriodChange={onBillingPeriodChange}
        planActions={planActions}
        planPrices={planPrices}
      />
    </SettingsPageContainer>
  );
};

const SettingsBillingPlansCloudSubscriptionContent = ({
  billingPeriod,
  currentPlanKey,
  onBillingPeriodChange,
  planPrices,
}: {
  billingPeriod: SubscriptionInterval.Month | SubscriptionInterval.Year;
  currentPlanKey: BillingPlanKey;
  onBillingPeriodChange: (
    billingPeriod: SubscriptionInterval.Month | SubscriptionInterval.Year,
  ) => void;
  planPrices: SettingsBillingPlansTableProps['planPrices'];
}) => {
  const planActionsWithModals = useCloudPlanActions(currentPlanKey);
  const { modals, ...planActions } = planActionsWithModals;

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlansTable
        billingPeriod={billingPeriod}
        onBillingPeriodChange={onBillingPeriodChange}
        planActions={planActions}
        planPrices={planPrices}
      />
      {modals}
    </SettingsPageContainer>
  );
};

const SettingsBillingPlansCloudContent = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { formatPrices } = useFormatPrices();
  const currentPlanKey = getCurrentPlanKey(
    currentWorkspace?.currentBillingSubscription?.metadata?.['plan'],
  );
  const [billingPeriod, setBillingPeriod] = useState<
    SubscriptionInterval.Month | SubscriptionInterval.Year
  >(SubscriptionInterval.Year);

  const planPrices = resolveSettingsBillingPlanPrices(formatPrices);

  if (
    !isDefined(currentPlanKey) ||
    !isDefined(currentWorkspace?.currentBillingSubscription)
  ) {
    return (
      <SettingsBillingPlansCloudFallbackContent
        billingPeriod={billingPeriod}
        onBillingPeriodChange={setBillingPeriod}
        planPrices={planPrices}
      />
    );
  }

  return (
    <SettingsBillingPlansCloudSubscriptionContent
      billingPeriod={billingPeriod}
      currentPlanKey={currentPlanKey}
      onBillingPeriodChange={setBillingPeriod}
      planPrices={planPrices}
    />
  );
};

export const SettingsBillingPlansContent = ({
  isPlansLoaded,
}: {
  isPlansLoaded: boolean;
}) => {
  if (!isPlansLoaded) {
    return null;
  }

  return <SettingsBillingPlansCloudContent />;
};
