import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminUserLookupWorkspaceTabsId';
import { useImpersonate } from '@/settings/admin-panel/hooks/useImpersonate';
import { useUserLookup } from '@/settings/admin-panel/hooks/useUserLookup';
import { adminPanelErrorState } from '@/settings/admin-panel/states/adminPanelErrorState';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { TextInput } from '@/ui/input/components/TextInput';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared';
import {
  Button,
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconSearch,
  Section,
} from 'twenty-ui';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledLinkContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledErrorSection = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledUserInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledContentContainer = styled.div`
  flex: 1;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

export const SettingsAdminGeneral = () => {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [userId, setUserId] = useState('');

  const { error: impersonateError } = useImpersonate();

  const { activeTabId, setActiveTabId } = useTabList(
    SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID,
  );
  const userLookupResult = useRecoilValue(userLookupResultState);
  const adminPanelError = useRecoilValue(adminPanelErrorState);

  const { handleUserLookup, isLoading } = useUserLookup();

  const canManageFeatureFlags = useRecoilValue(canManageFeatureFlagsState);

  const handleSearch = async () => {
    setActiveTabId('');

    const result = await handleUserLookup(userIdentifier);

    if (isDefined(result?.user?.id) && !adminPanelError) {
      setUserId(result.user.id.trim());
    }

    if (
      isDefined(result?.workspaces) &&
      result.workspaces.length > 0 &&
      !adminPanelError
    ) {
      setActiveTabId(result.workspaces[0].id);
    }
  };

  const shouldShowUserData = userLookupResult && !adminPanelError;

  const activeWorkspace = userLookupResult?.workspaces.find(
    (workspace) => workspace.id === activeTabId,
  );

  const tabs =
    userLookupResult?.workspaces.map((workspace) => ({
      id: workspace.id,
      title: workspace.name,
      logo:
        getImageAbsoluteURI({
          imageUrl: isNonEmptyString(workspace.logo)
            ? workspace.logo
            : DEFAULT_WORKSPACE_LOGO,
          baseUrl: REACT_APP_SERVER_BASE_URL,
        }) ?? '',
    })) ?? [];

  const userFullName = `${userLookupResult?.user.firstName || ''} ${
    userLookupResult?.user.lastName || ''
  }`.trim();

  return (
    <>
      <Section>
        <H2Title
          title={
            canManageFeatureFlags
              ? 'Feature Flags & Impersonation'
              : 'User Impersonation'
          }
          description={
            canManageFeatureFlags
              ? 'Look up users and manage their workspace feature flags or impersonate them.'
              : 'Look up users to impersonate them.'
          }
        />

        <StyledContainer>
          <StyledLinkContainer>
            <TextInput
              value={userIdentifier}
              onChange={setUserIdentifier}
              onInputEnter={handleSearch}
              placeholder="Enter user ID or email address"
              fullWidth
              disabled={isLoading}
            />
          </StyledLinkContainer>
          <Button
            Icon={IconSearch}
            variant="primary"
            accent="blue"
            title="Search"
            onClick={handleSearch}
            disabled={!userIdentifier.trim() || isLoading}
          />
        </StyledContainer>

        {(adminPanelError || impersonateError) && (
          <StyledErrorSection>
            {adminPanelError ?? impersonateError}
          </StyledErrorSection>
        )}
      </Section>

      {shouldShowUserData && (
        <Section>
          <StyledUserInfo>
            <H1Title title="User Info" fontColor={H1TitleFontColor.Primary} />
            <H2Title title={userFullName} description="User Name" />
            <H2Title
              title={userLookupResult.user.email}
              description="User Email"
            />
            <H2Title title={userLookupResult.user.id} description="User ID" />
          </StyledUserInfo>

          <H1Title title="Workspaces" fontColor={H1TitleFontColor.Primary} />
          <StyledTabListContainer>
            <TabList
              tabs={tabs}
              tabListInstanceId={SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID}
              behaveAsLinks={false}
            />
          </StyledTabListContainer>
          <StyledContentContainer>
            <SettingsAdminWorkspaceContent
              activeWorkspace={activeWorkspace}
              userId={userId}
            />
          </StyledContentContainer>
        </Section>
      )}
    </>
  );
};
