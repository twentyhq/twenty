import { SETTINGS_ADMIN_FEATURE_FLAGS_TABS } from '@/settings/admin-panel/constants/SettingsAdminFeatureFlagsTabs';
import { useFeatureFlagsManagement } from '@/settings/admin-panel/hooks/useFeatureFlagsManagement';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Button,
  getImageAbsoluteURI,
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconSearch,
  isDefined,
  Section,
  Toggle,
} from 'twenty-ui';

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
  margin-top: ${({ theme }) => theme.spacing(0.5)};
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

export const SettingsAdminFeatureFlags = () => {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');

  const { activeTabIdState } = useTabList(
    SETTINGS_ADMIN_FEATURE_FLAGS_TABS.COMPONENT_INSTANCE_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);

  const {
    userLookupResult,
    handleUserLookup,
    handleFeatureFlagUpdate,
    isLoading,
    error,
  } = useFeatureFlagsManagement();

  const handleSearch = async () => {
    setActiveWorkspaceId('');
    await handleUserLookup(userIdentifier);
  };

  const shouldShowUserData = userLookupResult && !error;

  if (
    isDefined(userLookupResult?.workspaces.length) &&
    !activeWorkspaceId &&
    !error
  ) {
    setActiveWorkspaceId(userLookupResult.workspaces[0].id);
  }

  const tabs =
    userLookupResult?.workspaces.map((workspace) => ({
      id: workspace.id,
      title: workspace.name,
      logo:
        getImageAbsoluteURI(
          workspace.logo === null ? DEFAULT_WORKSPACE_LOGO : workspace.logo,
        ) ?? '',
    })) ?? [];

  const activeWorkspace = userLookupResult?.workspaces.find(
    (workspace) => workspace.id === activeTabId,
  );

  const renderWorkspaceContent = () => {
    if (!activeWorkspace) return null;

    return (
      <>
        <H2Title title={activeWorkspace.name} description={'Workspace Name'} />
        <H2Title
          title={`${activeWorkspace.totalUsers} ${activeWorkspace.totalUsers > 1 ? 'Users' : 'User'}`}
          description={'Total Users'}
        />
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
      </>
    );
  };

  return (
    <SubMenuTopBarContainer
      title="Feature Flags"
      links={[
        { children: 'Admin', href: getSettingsPagePath(SettingsPath.Admin) },
        { children: 'Feature Flags' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="Feature Flags Management"
            description="Look up users and manage their workspace feature flags."
          />

          <StyledContainer>
            <StyledLinkContainer>
              <TextInput
                value={userIdentifier}
                onChange={setUserIdentifier}
                placeholder="Enter user ID or email"
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

          {error && <StyledErrorSection>{error}</StyledErrorSection>}
        </Section>

        {shouldShowUserData && (
          <Section>
            <StyledUserInfo>
              <H1Title title="User Info" fontColor={H1TitleFontColor.Primary} />
              <H2Title
                title={`${userLookupResult.user.firstName || ''} ${userLookupResult.user.lastName || ''}`.trim()}
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
                tabListInstanceId={
                  SETTINGS_ADMIN_FEATURE_FLAGS_TABS.COMPONENT_INSTANCE_ID
                }
                behaveAsLinks={false}
              />
            </StyledTabListContainer>
            <StyledContentContainer>
              {renderWorkspaceContent()}
            </StyledContentContainer>
          </Section>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
