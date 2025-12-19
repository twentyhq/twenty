import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SSO/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityAuthBypassOptionsList } from '@/settings/security/components/SettingsSecurityAuthBypassOptionsList';
import { SettingsSecurityAuthProvidersOptionsList } from '@/settings/security/components/SettingsSecurityAuthProvidersOptionsList';
import { SettingsSecurityEditableProfileFields } from '@/settings/security/components/SettingsSecurityEditableProfileFields';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { SettingsSecurityOther } from '@/settings/security/components/SettingsSecurityOther';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { H2Title, IconLock } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

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

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const authProviders = useRecoilValue(authProvidersState);
  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);
  const [currentWorkspace] = useRecoilState(currentWorkspaceState);

  const hasSsoIdentityProviders = SSOIdentitiesProviders.length > 0;
  const hasDirectAuthEnabled =
    currentWorkspace?.isGoogleAuthEnabled ||
    currentWorkspace?.isMicrosoftAuthEnabled ||
    currentWorkspace?.isPasswordAuthEnabled;
  const hasBypassProviderAvailable =
    authProviders?.google ||
    authProviders?.microsoft ||
    authProviders?.password;
  const shouldShowBypassSection =
    hasSsoIdentityProviders &&
    !hasDirectAuthEnabled &&
    hasBypassProviderAvailable;

  return (
    <SubMenuTopBarContainer
      title={t`Security`}
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
                  color="transparent"
                  Icon={IconLock}
                  variant="border"
                />
              }
            />
            <SettingsSSOIdentitiesProvidersListCard />
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
          <Section>
            <StyledContainer>
              <H2Title
                title={t`Editable Profile Fields`}
                description={t`Choose which profile fields users with the Edit Profile permission can modify`}
              />
              <SettingsSecurityEditableProfileFields />
            </StyledContainer>
          </Section>
          {shouldShowBypassSection && (
            <Section>
              <StyledContainer>
                <H2Title
                  title={t`SSO Bypass`}
                  description={t`Configure fallback login methods for users with SSO bypass permissions`}
                />
                <SettingsSecurityAuthBypassOptionsList />
              </StyledContainer>
            </Section>
          )}
          {isMultiWorkspaceEnabled && (
            <Section>
              <H2Title
                title={t`Support`}
                description={t`Manage support access settings`}
              />
              <ToggleImpersonate />
            </Section>
          )}
          <Section>
            <H2Title
              title={t`Other`}
              description={t`Other security settings`}
            />
            <SettingsSecurityOther />
          </Section>
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
