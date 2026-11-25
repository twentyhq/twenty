import {
  SettingsBillingApplicationRow,
  type SettingsBillingApplicationRowProps,
} from '@/settings/billing/components/internal/SettingsBillingApplicationRow';
import {
  StyledSettingsBillingCard,
  StyledSettingsBillingCardHeader,
  StyledSettingsBillingCardTitle,
  StyledSettingsBillingCardTitleLabel,
} from '@/settings/billing/components/internal/SettingsBillingCard';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
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

type SettingsBillingApplicationsSectionProps = {
  applicationSubscriptionItems: (SettingsBillingApplicationRowProps['applicationSubscriptionItem'] & {
    id: string;
  })[];
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

  if (applicationSubscriptionItems.length === 0) {
    return null;
  }

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
          {applicationSubscriptionItems.map((applicationSubscriptionItem) => (
            <SettingsBillingApplicationRow
              key={applicationSubscriptionItem.id}
              applicationSubscriptionItem={applicationSubscriptionItem}
              isYearlyPlan={isYearlyPlan}
            />
          ))}
        </StyledApplicationList>
      </StyledSettingsBillingCard>
    </Section.Root>
  );
};
