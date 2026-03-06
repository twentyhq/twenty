import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPublicDomainsListCard } from '@/settings/domains/components/SettingsPublicDomainsListCard';
import { SettingsWorkspaceDomainCard } from '@/settings/domains/components/SettingsWorkspaceDomainCard';
import { SettingsApprovedAccessDomainsListCard } from '@/settings/security/components/approvedAccessDomains/SettingsApprovedAccessDomainsListCard';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsEmailingDomains } from '~/pages/settings/emailing-domains/SettingsEmailingDomains';

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[10]};
  min-height: 200px;
`;

const StyledSectionContainer = styled.div`
  flex-shrink: 0;
`;

export const SettingsDomains = () => {
  const { t } = useLingui();
  const featureFlags = useFeatureFlagsMap();

  const isPublicDomainEnabled =
    featureFlags[FeatureFlagKey.IS_PUBLIC_DOMAIN_ENABLED];

  const isEmailingDomainsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAILING_DOMAIN_ENABLED,
  );

  return (
    <SubMenuTopBarContainer
      title={t`Domains`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Domains</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledMainContent>
          <StyledSectionContainer>
            <Section>
              <H2Title
                title={t`Workspace Domain`}
                description={t`Edit your subdomain name or set a custom domain.`}
              />
              <SettingsWorkspaceDomainCard />
            </Section>
          </StyledSectionContainer>
          <StyledSectionContainer>
            <Section>
              <H2Title
                title={t`Approved Domains`}
                description={t`Anyone with an email address at these domains is allowed to sign up for this workspace.`}
              />
              <SettingsApprovedAccessDomainsListCard />
            </Section>
          </StyledSectionContainer>
          {isEmailingDomainsEnabled && (
            <StyledSectionContainer>
              <Section>
                <H2Title
                  title={t`Emailing Domains`}
                  description={t`Configure and verify domains for emailing from this workspace.`}
                />
                <SettingsEmailingDomains />
              </Section>
            </StyledSectionContainer>
          )}
          {isPublicDomainEnabled && (
            <StyledSectionContainer>
              <Section>
                <H2Title
                  title={t`Public Domains`}
                  description={t`Provision a complete and secure hosting environment on these domains.`}
                />
                <SettingsPublicDomainsListCard />
              </Section>
            </StyledSectionContainer>
          )}
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
