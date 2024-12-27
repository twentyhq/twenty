import styled from '@emotion/styled';
import { H2Title, IconLock, Section, Tag } from 'twenty-ui';

import { isSSOEnabledState } from '@/client-config/states/isSSOEnabledState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityOptionsList } from '@/settings/security/components/SettingsSecurityOptionsList';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(10)};
  min-height: 200px;
`;

const StyledSSOSection = styled(Section)`
  flex-shrink: 0;
`;

export const SettingsSecurity = () => {
  const isSSOEnabled = useRecoilValue(isSSOEnabledState);
  const isSSOSectionDisplay =
    useIsFeatureEnabled('IS_SSO_ENABLED') && isSSOEnabled;

  return (
    <SubMenuTopBarContainer
      title="Security"
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Security' },
      ]}
    >
      <SettingsPageContainer>
        <StyledMainContent>
          {isSSOSectionDisplay && (
            <StyledSSOSection>
              <H2Title
                title="SSO"
                description="Configure an SSO connection"
                adornment={
                  <Tag
                    text={'Enterprise'}
                    color={'transparent'}
                    Icon={IconLock}
                    variant={'border'}
                  />
                }
              />
              <SettingsSSOIdentitiesProvidersListCard />
            </StyledSSOSection>
          )}
          <Section>
            <StyledContainer>
              <H2Title
                title="Authentication"
                description="Customize your workspace security"
              />
              <SettingsSecurityOptionsList />
            </StyledContainer>
          </Section>
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
