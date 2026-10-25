import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import {
  IconFileCheck,
  IconFileText,
  IconListCheck,
  IconStack2,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { TWENTY_TRUST_CENTER_URLS } from '@/settings/privacy/constants/TwentyTrustCenterUrls';
import { type PrivacyAudience } from '@/settings/privacy/types/PrivacyAudience';

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

type SettingsPrivacyComplianceProps = {
  privacyAudience: PrivacyAudience;
};

export const SettingsPrivacyCompliance = ({
  privacyAudience,
}: SettingsPrivacyComplianceProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const gdprCard = (
    <SettingsCard
      href={TWENTY_TRUST_CENTER_URLS.gdpr}
      Icon={<IconListCheck size={theme.icon.size.md} />}
      title={t`GDPR`}
      description={t`Built to meet EU data protection rules`}
    />
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Compliance`}
        description={t`Audited controls and the agreements that cover your data.`}
      />
      <StyledCardsGrid>
        <SettingsCard
          href={TWENTY_TRUST_CENTER_URLS.soc2}
          Icon={<IconFileCheck size={theme.icon.size.md} />}
          title={t`SOC 2`}
          description={t`Independently audited security controls`}
        />
        {privacyAudience === 'eu' && gdprCard}
        <SettingsCard
          to={getSettingsPath(SettingsPath.LegalDpa)}
          Icon={<IconFileText size={theme.icon.size.md} />}
          title={t`Data Processing Agreement`}
          description={t`Generate a signed copy in one click`}
        />
        <SettingsCard
          href={TWENTY_TRUST_CENTER_URLS.subprocessors}
          Icon={<IconStack2 size={theme.icon.size.md} />}
          title={t`Subprocessors`}
          description={t`Every provider that handles your data`}
        />
        {privacyAudience === 'global' && gdprCard}
      </StyledCardsGrid>
    </Section.Root>
  );
};
