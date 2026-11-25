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
  StyledSettingsBillingCardFieldList,
  StyledSettingsBillingCardFieldListWithDivider,
  StyledSettingsBillingCardGridBody,
  StyledSettingsBillingCardHeader,
  StyledSettingsBillingCardTitle,
  StyledSettingsBillingCardTitleLabel,
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
            <StyledSettingsBillingCardTitle>
              <IconCloud
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.md}
                color={theme.color.blue}
              />
              <StyledSettingsBillingCardTitleLabel>{t`Twenty Cloud`}</StyledSettingsBillingCardTitleLabel>
            </StyledSettingsBillingCardTitle>
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconBrandGithub />}
              onClick={() => openUrlInNewTab(TWENTY_REPOSITORY_URL)}
            >
              {t`Source code`}
            </Button>
          </StyledSettingsBillingCardHeader>
          <StyledSettingsBillingCardGridBody>
            <StyledSettingsBillingCardFieldList>
              <BillingFieldRow Icon={IconLock} label={t`Encryption`}>
                {t`In transit and at rest`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconDatabase} label={t`Isolation`}>
                {t`Own database schema`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconCpu} label={t`AI training`}>
                {t`Never, by Twenty or providers`}
              </BillingFieldRow>
            </StyledSettingsBillingCardFieldList>
            <StyledSettingsBillingCardFieldListWithDivider>
              <BillingFieldRow Icon={IconHistory} label={t`Backups`}>
                {t`Daily, kept 30 days`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconBell} label={t`Breaches`}>
                {t`Notified within 72 hours`}
              </BillingFieldRow>
              <BillingFieldRow Icon={IconMap} label={t`Hosting`}>
                {t`AWS, Frankfurt, Germany`}
              </BillingFieldRow>
            </StyledSettingsBillingCardFieldListWithDivider>
          </StyledSettingsBillingCardGridBody>
        </StyledSettingsBillingCard>
        <SettingsPrivacyCompliance />
      </StyledContent>
    </Section.Root>
  );
};
