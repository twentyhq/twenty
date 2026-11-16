import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconEuStars,
  IconRosetteDiscountCheck,
  IconSignature,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { TWENTY_TRUST_CENTER_URLS } from '@/settings/privacy/constants/TwentyTrustCenterUrls';

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledProviderLogo = styled.span`
  background-color: currentColor;
  border-radius: 1px;
  height: ${themeCssVariables.spacing[1]};
  width: ${themeCssVariables.spacing[1]};
`;

export const SettingsPrivacyCompliance = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledCardsGrid>
      <SettingsCard
        href={TWENTY_TRUST_CENTER_URLS.soc2}
        illustrationColor="green"
        Icon={
          <IconRosetteDiscountCheck
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.md}
          />
        }
        title={t`SOC 2`}
        description={t`Independently audited security controls`}
      />
      <SettingsCard
        to={getSettingsPath(SettingsPath.LegalDpa)}
        illustrationColor="orange"
        Icon={
          <IconSignature
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.md}
          />
        }
        title={t`Data Processing Agreement`}
        description={t`Generate a signed copy in one click`}
      />
      <SettingsCard
        href={TWENTY_TRUST_CENTER_URLS.subprocessors}
        illustrationColor="purple"
        Icon={
          <>
            <StyledProviderLogo />
            <StyledProviderLogo />
            <StyledProviderLogo />
          </>
        }
        title={t`Subprocessors`}
        description={t`Every provider that handles your data`}
      />
      <SettingsCard
        href={TWENTY_TRUST_CENTER_URLS.gdpr}
        illustrationColor="blue"
        Icon={<IconEuStars size={theme.icon.size.md} />}
        title={t`GDPR`}
        description={t`Built to meet EU data protection rules`}
      />
    </StyledCardsGrid>
  );
};
