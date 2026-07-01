import {
  StyledSettingsBillingCard,
  StyledSettingsBillingCardHeader,
} from '@/settings/billing/components/internal/SettingsBillingCard';
import { SettingsTextLink } from '@/settings/components/SettingsTextLink';
import { WorkspaceMemberAvatarStack } from '@/workspace-member/components/WorkspaceMemberAvatarStack';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ComponentProps, type ReactNode } from 'react';
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
import { Button } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

type BillingStatusTone = 'blue' | 'gray' | 'orange' | 'red' | 'sky';

const StyledSettingsBillingCardGridBody = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[6]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

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
        : tone === 'sky'
          ? themeCssVariables.color.sky4
          : tone === 'gray'
            ? themeCssVariables.color.gray4
            : themeCssVariables.color.blue4};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ tone }) =>
    tone === 'red'
      ? themeCssVariables.color.red11
      : tone === 'orange'
        ? themeCssVariables.color.orange11
        : tone === 'sky'
          ? themeCssVariables.color.sky11
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
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: 92px minmax(0, 1fr);
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

const StyledScheduledChangeHeader = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.background.transparent.light};
  border-top: 1px solid ${themeCssVariables.background.transparent.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: 32px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledScheduledChangeTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledScheduledChangeDate = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledScheduledChangeGrid = styled.div<{ columns: number }>`
  display: grid;
  gap: ${themeCssVariables.spacing[6]};
  grid-template-columns: ${({ columns }) =>
    `repeat(${columns}, minmax(0, 1fr))`};
  padding: ${themeCssVariables.spacing[3]};

  @media (max-width: 640px) {
    gap: 0;
    grid-template-columns: 1fr;
  }
`;

const StyledScheduledChangeItem = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: 92px minmax(0, 1fr);
  min-height: 24px;
  min-width: 0;

  & + & {
    border-left: 1px solid ${themeCssVariables.background.transparent.light};
    padding-left: ${themeCssVariables.spacing[6]};
  }

  @media (max-width: 640px) {
    & + & {
      border-left: 0;
      border-top: 1px solid ${themeCssVariables.background.transparent.light};
      padding-left: 0;
      padding-top: ${themeCssVariables.spacing[3]};
    }

    &:not(:last-child) {
      padding-bottom: ${themeCssVariables.spacing[3]};
    }
  }
`;

type BillingFieldRowProps = {
  Icon: (props: TablerIconsProps) => ReactNode;
  label: string;
  children: ReactNode;
};

const BillingFieldRow = ({ Icon, label, children }: BillingFieldRowProps) => {
  const theme = useTheme();

  return (
    <StyledBillingFieldRow>
      <StyledBillingFieldLabel>
        <Icon size={16} stroke={theme.icon.stroke.sm} />
        <OverflowingTextWithTooltip text={label} />
      </StyledBillingFieldLabel>
      <StyledBillingFieldValue>{children}</StyledBillingFieldValue>
    </StyledBillingFieldRow>
  );
};

type ScheduledBillingChangeFieldProps = {
  Icon: (props: TablerIconsProps) => ReactNode;
  label: string;
  value: string;
};

const ScheduledBillingChangeField = ({
  Icon,
  label,
  value,
}: ScheduledBillingChangeFieldProps) => {
  const theme = useTheme();

  return (
    <StyledScheduledChangeItem>
      <StyledBillingFieldLabel>
        <Icon size={16} stroke={theme.icon.stroke.sm} />
        <OverflowingTextWithTooltip text={label} />
      </StyledBillingFieldLabel>
      <StyledBillingFieldValue>{value}</StyledBillingFieldValue>
    </StyledScheduledChangeItem>
  );
};

type SettingsBillingSubscriptionInfoCardProps = {
  canCancelIntervalSwitch: boolean;
  canCancelPlanSwitch: boolean;
  canDisplaySwitchToMonthlyAction: boolean;
  canDisplaySwitchToYearlyAction: boolean;
  canStartSubscription: boolean;
  canSwitchToOrganizationPlan: boolean;
  canSwitchToProPlan: boolean;
  creditsSubtotalDetails?: string;
  creditsSubtotalValue: string;
  currentIntervalLabel: string;
  displayedSubscriptionDate?: string;
  isCancellationScheduled: boolean;
  isEndTrialPeriodDisabled: boolean;
  isSubscriptionActionDisabled: boolean;
  isTrialPeriod: boolean;
  isUpdatePaymentDisabled: boolean;
  onCancelIntervalSwitch: () => void;
  onCancelPlanSwitch: () => void;
  onEndTrialPeriod: () => void;
  onSwitchToMonthly: () => void;
  onSwitchToOrganization: () => void;
  onSwitchToPro: () => void;
  onSwitchToYearly: () => void;
  onUpdatePayment: () => void;
  planLabel: string;
  scheduledChangeItems: ScheduledBillingChangeFieldProps[];
  scheduledChangeStartDate?: string;
  seatsSubtotalDetails?: string;
  seatsSubtotalValue: string;
  shouldUpdatePayment: boolean;
  statusDescriptor: {
    label: string;
    tone: BillingStatusTone;
  };
  subscriptionDateLabel: string;
  totalDisplay?: string;
  totalIntervalSubtitle: string;
  totalWorkspaceMembersCount?: number | null;
  workspaceMemberDefaultName: string;
  workspaceMembers: ComponentProps<
    typeof WorkspaceMemberAvatarStack
  >['workspaceMembers'];
};

export const SettingsBillingSubscriptionInfoCard = ({
  canCancelIntervalSwitch,
  canCancelPlanSwitch,
  canDisplaySwitchToMonthlyAction,
  canDisplaySwitchToYearlyAction,
  canStartSubscription,
  canSwitchToOrganizationPlan,
  canSwitchToProPlan,
  creditsSubtotalDetails,
  creditsSubtotalValue,
  currentIntervalLabel,
  displayedSubscriptionDate,
  isCancellationScheduled,
  isEndTrialPeriodDisabled,
  isSubscriptionActionDisabled,
  isTrialPeriod,
  isUpdatePaymentDisabled,
  onCancelIntervalSwitch,
  onCancelPlanSwitch,
  onEndTrialPeriod,
  onSwitchToMonthly,
  onSwitchToOrganization,
  onSwitchToPro,
  onSwitchToYearly,
  onUpdatePayment,
  planLabel,
  scheduledChangeItems,
  scheduledChangeStartDate,
  seatsSubtotalDetails,
  seatsSubtotalValue,
  shouldUpdatePayment,
  statusDescriptor,
  subscriptionDateLabel,
  totalDisplay,
  totalIntervalSubtitle,
  totalWorkspaceMembersCount,
  workspaceMemberDefaultName,
  workspaceMembers,
}: SettingsBillingSubscriptionInfoCardProps) => {
  const { t } = useLingui();
  const hasScheduledChange = scheduledChangeItems.length > 0;

  return (
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
              {canCancelIntervalSwitch && (
                <Button
                  Icon={IconCircleX}
                  title={t`Cancel interval switching`}
                  variant="secondary"
                  size="small"
                  onClick={onCancelIntervalSwitch}
                  disabled={isSubscriptionActionDisabled}
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
                  onClick={onSwitchToOrganization}
                  disabled={isSubscriptionActionDisabled}
                />
              )}
              {canStartSubscription && (
                <Button
                  Icon={IconArrowUp}
                  title={t`Subscribe Now`}
                  variant="primary"
                  accent="blue"
                  size="small"
                  onClick={onEndTrialPeriod}
                  disabled={isEndTrialPeriodDisabled}
                />
              )}
              {canSwitchToProPlan && (
                <Button
                  Icon={IconArrowDown}
                  title={t`Switch to Pro`}
                  variant="secondary"
                  size="small"
                  onClick={onSwitchToPro}
                  disabled={isSubscriptionActionDisabled}
                />
              )}
              {canCancelPlanSwitch && (
                <Button
                  Icon={IconCircleX}
                  title={t`Cancel plan switching`}
                  variant="secondary"
                  size="small"
                  onClick={onCancelPlanSwitch}
                  disabled={isSubscriptionActionDisabled}
                />
              )}
            </>
          )}
        </StyledHeaderActions>
      </StyledSettingsBillingCardHeader>
      <StyledSettingsBillingCardGridBody>
        <StyledBillingFieldList>
          <BillingFieldRow label={t`Seats`} Icon={IconUserCircle}>
            <WorkspaceMemberAvatarStack
              workspaceMembers={workspaceMembers}
              totalWorkspaceMembersCount={totalWorkspaceMembersCount}
              defaultAvatarName={workspaceMemberDefaultName}
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
                    onClick={onSwitchToYearly}
                    disabled={isSubscriptionActionDisabled}
                  >
                    {t`Switch to yearly`}
                  </SettingsTextLink>
                </>
              )}
              {canDisplaySwitchToMonthlyAction && (
                <>
                  <StyledBillingIntervalSeparator>
                    ·
                  </StyledBillingIntervalSeparator>
                  <SettingsTextLink
                    variant="secondary"
                    title={t`Downgrade to monthly`}
                    onClick={onSwitchToMonthly}
                    disabled={isSubscriptionActionDisabled}
                  >
                    {t`Downgrade to monthly`} →
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
          <BillingFieldRow label={t`Seats`} Icon={IconUsers}>
            {seatsSubtotalValue}
            {seatsSubtotalDetails && (
              <StyledSecondaryText>{seatsSubtotalDetails}</StyledSecondaryText>
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
              <StyledSecondaryText>{totalIntervalSubtitle}</StyledSecondaryText>
            )}
          </BillingFieldRow>
        </StyledBillingFieldListWithDivider>
      </StyledSettingsBillingCardGridBody>
      {hasScheduledChange && (
        <>
          <StyledScheduledChangeHeader>
            <StyledScheduledChangeTitle>
              {t`Scheduled change`}
            </StyledScheduledChangeTitle>
            {isDefined(scheduledChangeStartDate) && (
              <StyledScheduledChangeDate>
                · {t`Starting ${scheduledChangeStartDate}`}
              </StyledScheduledChangeDate>
            )}
          </StyledScheduledChangeHeader>
          <StyledScheduledChangeGrid columns={scheduledChangeItems.length}>
            {scheduledChangeItems.map((scheduledChangeItem) => (
              <ScheduledBillingChangeField
                Icon={scheduledChangeItem.Icon}
                key={scheduledChangeItem.label}
                label={scheduledChangeItem.label}
                value={scheduledChangeItem.value}
              />
            ))}
          </StyledScheduledChangeGrid>
        </>
      )}
    </StyledSettingsBillingCard>
  );
};
