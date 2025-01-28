import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { SETTINGS_ADMIN_FEATURE_FLAGS_TAB_ID } from '@/settings/admin-panel/constants/SettingsAdminFeatureFlagsTabs';
import { useFeatureFlagsManagement } from '@/settings/admin-panel/hooks/useFeatureFlagsManagement';
import { useImpersonate } from '@/settings/admin-panel/hooks/useImpersonate';
import { TextInput } from '@/ui/input/components/TextInput';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { getImageAbsoluteURI } from 'twenty-shared';
import {
  Button,
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconSearch,
  IconUser,
  isDefined,
  Section,
  Toggle,
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

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
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

export const SettingsAdminContent = () => {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [userId, setUserId] = useState('');

  const {
    handleImpersonate,
    isLoading: isImpersonateLoading,
    error: impersonateError,
    canImpersonate,
  } = useImpersonate();

  const { activeTabId, setActiveTabId } = useTabList(
    SETTINGS_ADMIN_FEATURE_FLAGS_TAB_ID,
  );

  const {
    userLookupResult,
    handleUserLookup,
    handleFeatureFlagUpdate,
    isLoading,
    error,
  } = useFeatureFlagsManagement();

  const canManageFeatureFlags = useRecoilValue(canManageFeatureFlagsState);

  const handleSearch = async () => {
    setActiveTabId('');

    const result = await handleUserLookup(userIdentifier);

    if (isDefined(result?.user?.id) && !error) {
      setUserId(result.user.id.trim());
    }

    if (
      isDefined(result?.workspaces) &&
      result.workspaces.length > 0 &&
      !error
    ) {
      setActiveTabId(result.workspaces[0].id);
    }
  };

  const shouldShowUserData = userLookupResult && !error;

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

  const renderWorkspaceContent = () => {
    if (!activeWorkspace) return null;

    return (
      <>
        <H2Title title={activeWorkspace.name} description={'Workspace Name'} />
        <H2Title
          title={`${activeWorkspace.totalUsers} ${
            activeWorkspace.totalUsers > 1 ? 'Users' : 'User'
          }`}
          description={'Total Users'}
        />
        {canImpersonate && (
          <Button
            Icon={IconUser}
            variant="primary"
            accent="blue"
            title={'Impersonate'}
            onClick={() => handleImpersonate(userId, activeWorkspace.id)}
            disabled={
              isImpersonateLoading ||
              activeWorkspace.allowImpersonation === false
            }
            dataTestId="impersonate-button"
          />
        )}

        {canManageFeatureFlags && (
          <StyledTable>
            <TableRow
              gridAutoColumns="1fr 100px"
              mobileGridAutoColumns="1fr 80px"
            >
              <TableHeader>Feature Flag</TableHeader>
              <TableHeader align="right">Status</TableHeader>
            </TableRow>

            {activeWorkspace.featureFlags.map((flag) => (
              <TableRow
                gridAutoColumns="1fr 100px"
                mobileGridAutoColumns="1fr 80px"
                key={flag.key}
              >
                <TableCell>{flag.key}</TableCell>
                <TableCell align="right">
                  <Toggle
                    value={flag.value}
                    onChange={(newValue) =>
                      handleFeatureFlagUpdate(
                        activeWorkspace.id,
                        flag.key,
                        newValue,
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </StyledTable>
        )}
      </>
    );
  };

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

        {(error || impersonateError) && (
          <StyledErrorSection>{error ?? impersonateError}</StyledErrorSection>
        )}
      </Section>

      {shouldShowUserData && (
        <Section>
          <StyledUserInfo>
            <H1Title title="User Info" fontColor={H1TitleFontColor.Primary} />
            <H2Title
              title={`${userLookupResult.user.firstName || ''} ${
                userLookupResult.user.lastName || ''
              }`.trim()}
              description="User Name"
            />
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
              tabListInstanceId={SETTINGS_ADMIN_FEATURE_FLAGS_TAB_ID}
              behaveAsLinks={false}
            />
          </StyledTabListContainer>
          <StyledContentContainer>
            {renderWorkspaceContent()}
          </StyledContentContainer>
        </Section>
      )}
    </>
  );
};
