import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import {
  StyledSettingsBillingCard,
  StyledSettingsBillingCardHeader,
  StyledSettingsBillingCardTitle,
  StyledSettingsBillingCardTitleLabel,
} from '@/settings/billing/components/internal/SettingsBillingCard';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isApplicationBillingPriceUnit } from 'twenty-shared/application';
import { assertUnreachable } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconApps } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledApplicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledApplicationRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: ${themeCssVariables.spacing[6]};
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

type SettingsBillingApplicationsSectionProps = {
  applicationSubscriptionItems: {
    id: string;
    quantity?: number | null;
    unitAmount?: number | null;
    billingProduct: {
      name: string;
      metadata: {
        applicationName?: string | null;
        applicationPricePer?: string | null;
      };
    };
  }[];
  applicationsCount: number;
  isYearlyPlan: boolean;
};

export const SettingsBillingApplicationsSection = ({
  applicationSubscriptionItems,
  applicationsCount,
  isYearlyPlan,
}: SettingsBillingApplicationsSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();

  if (applicationSubscriptionItems.length === 0) {
    return null;
  }

  const formatMonthlyAmount = (cents: number) =>
    `$${formatNumber((isYearlyPlan ? cents / 12 : cents) / 100, {
      decimals: 2,
    })}`;

  const formatQuantity = ({
    quantity,
    applicationPricePer,
  }: {
    quantity: number;
    applicationPricePer?: string | null;
  }) => {
    if (!isApplicationBillingPriceUnit(applicationPricePer)) {
      return `${quantity}`;
    }

    switch (applicationPricePer) {
      case 'WORKSPACE_MEMBER':
        return quantity === 1 ? t`${quantity} member` : t`${quantity} members`;
      case 'CONNECTED_ACCOUNT':
        return quantity === 1
          ? t`${quantity} account`
          : t`${quantity} accounts`;
      default:
        return assertUnreachable(applicationPricePer);
    }
  };

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
          <Text size="md" color="tertiary">{t`Per month`}</Text>
        </StyledSettingsBillingCardHeader>
        <StyledApplicationList>
          {applicationSubscriptionItems.map((applicationSubscriptionItem) => {
            const quantity = applicationSubscriptionItem.quantity ?? 0;
            const unitAmountCents = applicationSubscriptionItem.unitAmount ?? 0;
            const { name, metadata } =
              applicationSubscriptionItem.billingProduct;

            return (
              <StyledApplicationRow key={applicationSubscriptionItem.id}>
                <StyledApplicationName>
                  <IconApps
                    size={theme.icon.size.md}
                    color={themeCssVariables.font.color.tertiary}
                  />
                  <Text size="md" truncate>
                    {metadata.applicationName ?? name}
                  </Text>
                </StyledApplicationName>
                <StyledApplicationAmount>
                  <Text render={<span />} size="md" color="tertiary">
                    {`${formatQuantity({ quantity, applicationPricePer: metadata.applicationPricePer })} × ${formatMonthlyAmount(unitAmountCents)} · `}
                  </Text>
                  <Text render={<span />} size="md">
                    {formatMonthlyAmount(quantity * unitAmountCents)}
                  </Text>
                </StyledApplicationAmount>
              </StyledApplicationRow>
            );
          })}
        </StyledApplicationList>
      </StyledSettingsBillingCard>
    </Section.Root>
  );
};
