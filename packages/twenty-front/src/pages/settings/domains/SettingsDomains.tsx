import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsWorkspaceDomainCard } from '@/settings/domains/components/SettingsWorkspaceDomainCard';
import { SettingsApprovedAccessDomainsListCard } from '@/settings/security/components/approvedAccessDomains/SettingsApprovedAccessDomainsListCard';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { FeatureFlagKey } from '~/generated/graphql';
import { SettingsOutboundMessageDomains } from '~/pages/settings/outbound-message-domains/SettingsOutboundMessageDomains';

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(10)};
  min-height: 200px;
`;

const StyledSection = styled(Section)`
  flex-shrink: 0;
`;

export const SettingsDomains = () => {
  const { t } = useLingui();

  const isOutboundMessageDomainsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_OUTBOUND_MESSAGE_DOMAIN_ENABLED,
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
          <StyledSection>
            <H2Title
              title={t`Workspace Domain`}
              description={t`Edit your subdomain name or set a custom domain.`}
            />
            <SettingsWorkspaceDomainCard />
          </StyledSection>
          <StyledSection>
            <H2Title
              title={t`Approved Domains`}
              description={t`Anyone with an email address at these domains is allowed to sign up for this workspace.`}
            />
            <SettingsApprovedAccessDomainsListCard />
          </StyledSection>
          {isOutboundMessageDomainsEnabled && (
            <StyledSection>
              <H2Title
                title={t`Outbound Message Domains`}
                description={t`Configure and verify domains for sending outbound emails from this workspace.`}
              />
              <SettingsOutboundMessageDomains />
            </StyledSection>
          )}
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
