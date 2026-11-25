import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import {
  StyledSettingsBillingCard,
  StyledSettingsBillingCardHeader,
  StyledSettingsBillingCardTitle,
  StyledSettingsBillingCardTitleLabel,
} from '@/settings/billing/components/internal/SettingsBillingCard';
import { useBillingSubscriptionCost } from '@/settings/billing/hooks/useBillingSubscriptionCost';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconApps } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledSecondaryText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  white-space: nowrap;
`;

const StyledApplicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledApplicationRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: 24px;
`;

const StyledApplicationName = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledApplicationAmount = styled.div`
  white-space: nowrap;
`;

export const SettingsBillingApplicationsSection = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();
  const { isYearlyPlan } = useCurrentBillingFlags();
  const { applicationSubscriptionItems } = useBillingSubscriptionCost();

  if (applicationSubscriptionItems.length === 0) {
    return null;
  }

  const formatMonthlyAmount = (cents: number) =>
    `$${formatNumber((isYearlyPlan ? cents / 12 : cents) / 100, {
      decimals: 2,
    })}`;

  const applicationsCount = applicationSubscriptionItems.length;
  const applicationsCountLabel =
    applicationsCount === 1
      ? t`${applicationsCount} paid app`
      : t`${applicationsCount} paid apps`;

  return (
    <Section.Root>
      <Section.Header
        title={t`Apps`}
        description={t`Paid apps installed in this workspace. Prices are added to your invoice`}
      />
      <StyledSettingsBillingCard>
        <StyledSettingsBillingCardHeader>
          <StyledSettingsBillingCardTitle>
            <IconApps
              size={theme.icon.size.md}
              color={themeCssVariables.font.color.tertiary}
            />
            <StyledSettingsBillingCardTitleLabel>
              {applicationsCountLabel}
            </StyledSettingsBillingCardTitleLabel>
          </StyledSettingsBillingCardTitle>
          <StyledSecondaryText>{t`Per month`}</StyledSecondaryText>
        </StyledSettingsBillingCardHeader>
        <StyledApplicationList>
          {applicationSubscriptionItems.map((applicationSubscriptionItem) => {
            const quantity = applicationSubscriptionItem.quantity ?? 0;
            const unitAmountCents = applicationSubscriptionItem.unitAmount ?? 0;

            return (
              <StyledApplicationRow key={applicationSubscriptionItem.id}>
                <StyledApplicationName>
                  <IconApps
                    size={theme.icon.size.md}
                    color={themeCssVariables.font.color.tertiary}
                  />
                  <OverflowingTextWithTooltip
                    text={applicationSubscriptionItem.billingProduct.name}
                  />
                </StyledApplicationName>
                <StyledApplicationAmount>
                  <StyledSecondaryText>
                    {`${quantity} × ${formatMonthlyAmount(unitAmountCents)} · `}
                  </StyledSecondaryText>
                  {formatMonthlyAmount(quantity * unitAmountCents)}
                </StyledApplicationAmount>
              </StyledApplicationRow>
            );
          })}
        </StyledApplicationList>
      </StyledSettingsBillingCard>
    </Section.Root>
  );
};
