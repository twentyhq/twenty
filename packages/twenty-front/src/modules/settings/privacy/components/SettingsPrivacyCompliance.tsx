import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconFileText, IconServer, IconShield } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { TWENTY_TRUST_CENTER_URL } from '@/settings/privacy/constants/TwentyTrustCenterUrl';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsPrivacyCompliance = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <Section.Root>
      <Section.Header
        title={t`Data protection`}
        description={t`Where your data lives and the commitments that cover it.`}
      />
      <StyledCardsContainer>
        <SettingsCard
          Icon={<IconServer size={theme.icon.size.md} />}
          title={t`Hosted in the EU`}
          description={t`Your workspace data is stored in Frankfurt, Germany.`}
        />
        <SettingsCard
          to={getSettingsPath(SettingsPath.LegalDpa)}
          Icon={<IconFileText size={theme.icon.size.md} />}
          title={t`Data Processing Agreement`}
          description={t`Review the agreement that applies to your workspace and generate a signed copy.`}
        />
        <SettingsCard
          href={TWENTY_TRUST_CENTER_URL}
          Icon={<IconShield size={theme.icon.size.md} />}
          title={t`Trust Center`}
          description={t`Security practices, certifications and the list of subprocessors.`}
        />
      </StyledCardsContainer>
    </Section.Root>
  );
};
