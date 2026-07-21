import {
  BillingFieldRow,
  ScheduledBillingChangeField,
  type ScheduledBillingChangeFieldProps,
} from '@/settings/billing/components/internal/SettingsBillingCardField';
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
  IconCalendarDue,
  IconClockPlay,
  IconCoins,
  IconSum,
  IconUserCircle,
  IconUsers,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type BillingStatusTone = 'blue' | 'gray' | 'orange' | 'red' | 'sky';

const STATUS_PILL_COLORS: Record<
  BillingStatusTone,
  { background: string; color: string }
> = {
  blue: {
    background: themeCssVariables.color.blue4,
    color: themeCssVariables.accent.accent11,
  },
  gray: {
    background: themeCssVariables.color.gray4,
    color: themeCssVariables.color.gray11,
  },
  orange: {
    background: themeCssVariables.color.orange4,
    color: themeCssVariables.color.orange11,
  },
  red: {
    background: themeCssVariables.color.red4,
    color: themeCssVariables.color.red11,
  },
  sky: {
    background: themeCssVariables.color.sky4,
    color: themeCssVariables.color.sky11,
  },
};

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
  background-color: ${({ tone }) => STATUS_PILL_COLORS[tone].background};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ tone }) => STATUS_PILL_COLORS[tone].color};
  corner-shape: round;
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
  corner-shape: round;
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

type SettingsBillingSubscriptionInfoCardProps = {
  canDisplaySwitchToMonthlyAction: boolean;
  canDisplaySwitchToYearlyAction: boolean;
  creditsSubtotalDetails?: string;
  creditsSubtotalValue: string;
  currentIntervalLabel: string;
  displayedSubscriptionDate?: string;
  headerActions: ReactNode;
  isSubscriptionActionDisabled: boolean;
  onSwitchToMonthly: () => void;
  onSwitchToYearly: () => void;
  planLabel: string;
  scheduledChangeItems: ScheduledBillingChangeFieldProps[];
  scheduledChangeStartDate?: string;
  seatsSubtotalDetails?: string;
  seatsSubtotalValue: string;
  statusDescriptor: {
    label: string;
    tone: BillingStatusTone;
  };
  subscriptionDateLabel: string;
  totalIntervalSubtitle?: string;
  totalValue: string;
  totalWorkspaceMembersCount?: number | null;
  workspaceMemberDefaultName: string;
  workspaceMembers: ComponentProps<
    typeof WorkspaceMemberAvatarStack
  >['workspaceMembers'];
};

export const SettingsBillingSubscriptionInfoCard = ({
  canDisplaySwitchToMonthlyAction,
  canDisplaySwitchToYearlyAction,
  creditsSubtotalDetails,
  creditsSubtotalValue,
  currentIntervalLabel,
  displayedSubscriptionDate,
  headerActions,
  isSubscriptionActionDisabled,
  onSwitchToMonthly,
  onSwitchToYearly,
  planLabel,
  scheduledChangeItems,
  scheduledChangeStartDate,
  seatsSubtotalDetails,
  seatsSubtotalValue,
  statusDescriptor,
  subscriptionDateLabel,
  totalIntervalSubtitle,
  totalValue,
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
        <StyledHeaderActions>{headerActions}</StyledHeaderActions>
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
            {totalValue}
            {isDefined(totalIntervalSubtitle) && (
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
