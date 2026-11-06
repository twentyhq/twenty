import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import {
  IconBell,
  IconBrandGithub,
  IconCloud,
  IconCpu,
  IconDatabase,
  IconHistory,
  IconLock,
  IconMap,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  StyledSettingsBillingCard,
  StyledSettingsBillingCardHeader,
} from '@/settings/billing/components/internal/SettingsBillingCard';
import { BillingFieldRow } from '@/settings/billing/components/internal/SettingsBillingCardField';
import { SettingsPrivacyCompliance } from '@/settings/privacy/components/SettingsPrivacyCompliance';
import { TWENTY_REPOSITORY_URL } from '@/settings/privacy/constants/TwentyRepositoryUrl';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeaderLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSafeguardColumns = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[6]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StyledSafeguardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledSafeguardListWithDivider = styled(StyledSafeguardList)`
  border-left: 1px solid ${themeCssVariables.background.transparent.light};
  padding-left: ${themeCssVariables.spacing[6]};

  @media (max-width: 640px) {
    border-left: 0;
    border-top: 1px solid ${themeCssVariables.background.transparent.light};
    padding-left: 0;
    padding-top: ${themeCssVariables.spacing[4]};
  }
`;

export const SettingsPrivacySafeguards = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <Section.Root>
      <Section.Header
        title={t`How your data is protected`}
        description={t`Safeguards, audits and the agreements that cover your data.`}
      />
      <StyledContent>
        <StyledSettingsBillingCard>
          <StyledSettingsBillingCardHeader>
            <StyledHeaderTitle>
              <IconCloud
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.md}
                color={theme.color.blue}
              />
              <StyledHeaderLabel>{t`Twenty Cloud`}</StyledHeaderLabel>
            </StyledHeaderTitle>
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconBrandGithub />}
              onClick={() => openUrlInNewTab(TWENTY_REPOSITORY_URL)}
            >
              {t`Source code`}
            </Button>
          </StyledSettingsBillingCardHeader>
          <StyledSafeguardColumns>
            <StyledSafeguardList>
              <BillingFieldRow Icon={IconLock} label={t`Encryption`}>
                {t`In transit and at rest`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconDatabase} label={t`Isolation`}>
                {t`Own database schema`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconCpu} label={t`AI training`}>
                {t`Never, by Twenty or providers`}
              </BillingFieldRow>
            </StyledSafeguardList>
            <StyledSafeguardListWithDivider>
              <BillingFieldRow Icon={IconHistory} label={t`Backups`}>
                {t`Daily, kept 30 days`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconBell} label={t`Breaches`}>
                {t`Notified within 72 hours`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconMap} label={t`Hosting`}>
                {t`AWS, Frankfurt, Germany`}
              </BillingFieldRow>
            </StyledSafeguardListWithDivider>
          </StyledSafeguardColumns>
        </StyledSettingsBillingCard>
        <SettingsPrivacyCompliance />
      </StyledContent>
    </Section.Root>
  );
};
