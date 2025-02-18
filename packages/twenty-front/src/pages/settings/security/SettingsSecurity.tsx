import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { H2Title, IconLock, Section, Tag } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SSO/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityAuthProvidersOptionsList } from '@/settings/security/components/SettingsSecurityAuthProvidersOptionsList';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsTrustedDomainsListCard } from '@/settings/security/components/workspaceTrustedDomains/SettingsTrustedDomainsListCard';

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(10)};
  min-height: 200px;
`;

const StyledSection = styled(Section)`
  flex-shrink: 0;
`;

export const SettingsSecurity = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Security`}
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Security</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledMainContent>
          <StyledSection>
            <H2Title
              title={t`SSO`}
              description={t`Configure an SSO connection`}
              adornment={
                <Tag
                  text={t`Enterprise`}
                  color={'transparent'}
                  Icon={IconLock}
                  variant={'border'}
                />
              }
            />
            <SettingsSSOIdentitiesProvidersListCard />
          </StyledSection>
          <StyledSection>
            <H2Title
              title={t`Approved Email Domain`}
              description={t`Anyone with an email address at these domains is allowed to sign up for this workspace.`}
            />
            <SettingsTrustedDomainsListCard />
          </StyledSection>
          <Section>
            <StyledContainer>
              <H2Title
                title={t`Authentication`}
                description={t`Customize your workspace security`}
              />
              <SettingsSecurityAuthProvidersOptionsList />
            </StyledContainer>
          </Section>
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
