import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useUserLookupAdminPanelMutation } from '~/generated-metadata/graphql';

import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsAdminVersionContainer } from '@/settings/admin-panel/components/SettingsAdminVersionContainer';
import { SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminUserLookupWorkspaceTabsId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconId,
  IconMail,
  IconSearch,
  IconUser,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminGeneral = () => {
  const [userIdentifier, setUserIdentifier] = useState('');
  const { enqueueErrorSnackBar } = useSnackBar();

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID,
  );
  const [userLookupResult, setUserLookupResult] = useRecoilState(
    userLookupResultState,
  );
  const [isUserLookupLoading, setIsUserLookupLoading] = useState(false);

  const [userLookup] = useUserLookupAdminPanelMutation();

  const currentUser = useRecoilValue(currentUserState);

  const canAccessFullAdminPanel = currentUser?.canAccessFullAdminPanel;

  const canImpersonate = currentUser?.canImpersonate;

  const canManageFeatureFlags = useRecoilValue(canManageFeatureFlagsState);

  const handleSearch = async () => {
    setActiveTabId('');
    setIsUserLookupLoading(true);
    setUserLookupResult(null);

    const response = await userLookup({
      variables: { userIdentifier },
      onCompleted: (data) => {
        setIsUserLookupLoading(false);
        if (isDefined(data?.userLookupAdminPanel)) {
          setUserLookupResult(data.userLookupAdminPanel);
        }
      },
      onError: (error) => {
        setIsUserLookupLoading(false);
        enqueueErrorSnackBar({
          apolloError: error,
        });
      },
    });

    const result = response.data?.userLookupAdminPanel;

    if (isDefined(result?.workspaces) && result.workspaces.length > 0) {
      setActiveTabId(result.workspaces[0].id);
    }
  };

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

  const userInfoItems = [
    {
      Icon: IconUser,
      label: t`Name`,
      value: userFullName,
    },
    {
      Icon: IconMail,
      label: t`Email`,
      value: userLookupResult?.user.email,
    },
    {
      Icon: IconId,
      label: t`ID`,
      value: userLookupResult?.user.id,
    },
  ];

  return (
    <>
      {canAccessFullAdminPanel && (
        <Section>
          <H2Title
            title={t`About`}
            description={t`Version of the application`}
          />
          <SettingsAdminVersionContainer />
        </Section>
      )}

      {canImpersonate && (
        <Section>
          <H2Title
            title={
              canManageFeatureFlags
                ? t`Feature Flags & Impersonation`
                : t`User Impersonation`
            }
            description={
              canManageFeatureFlags
                ? t`Look up users and manage their workspace feature flags or impersonate them.`
                : t`Look up users to impersonate them.`
            }
          />

          <StyledContainer>
            <SettingsTextInput
              instanceId="admin-user-lookup"
              value={userIdentifier}
              onChange={setUserIdentifier}
              onInputEnter={handleSearch}
              placeholder={t`Enter user ID or email address`}
              fullWidth
              disabled={isUserLookupLoading}
            />
            <Button
              Icon={IconSearch}
              variant="primary"
              accent="blue"
              title={t`Search`}
              onClick={handleSearch}
              disabled={!userIdentifier.trim() || isUserLookupLoading}
            />
          </StyledContainer>
        </Section>
      )}

      {isDefined(userLookupResult) && (
        <>
          <Section>
            <H2Title title={t`User Info`} description={t`About this user`} />
            <SettingsAdminTableCard
              items={userInfoItems}
              rounded
              gridAutoColumns="1fr 4fr"
            />
          </Section>
          <Section>
            <H2Title
              title={t`Workspaces`}
              description={t`All workspaces this user is a member of`}
            />
            <TabList
              tabs={tabs}
              behaveAsLinks={false}
              componentInstanceId={SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID}
            />
            <SettingsAdminWorkspaceContent activeWorkspace={activeWorkspace} />
          </Section>
        </>
      )}
    </>
  );
};
