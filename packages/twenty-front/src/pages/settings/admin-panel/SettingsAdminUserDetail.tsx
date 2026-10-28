import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { useParams } from 'react-router-dom';

import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import {
  getImageAbsoluteURI,
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminServerAdminAccess } from '@/settings/admin-panel/components/SettingsAdminServerAdminAccess';
import { SettingsAdminUserWorkspaceActions } from '@/settings/admin-panel/components/SettingsAdminUserWorkspaceActions';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminUserLookupWorkspaceTabsId';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Section } from 'twenty-ui/components/layout';
import {
  IconCalendar,
  IconId,
  IconLock,
  IconMail,
  IconUser,
} from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  type UserLookupAdminPanelQuery,
  UserLookupAdminPanelDocument,
} from '~/generated-admin/graphql';

export const SettingsAdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const apolloAdminClient = useApolloAdminClient();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID,
  );

  const { data: userLookupData, loading: isLoading } =
    useQuery<UserLookupAdminPanelQuery>(UserLookupAdminPanelDocument, {
      client: apolloAdminClient,
      variables: { userIdentifier: userId },
      skip: !userId,
    });

  const userLookupResult = userLookupData?.userLookupAdminPanel;

  const currentUser = useAtomStateValue(currentUserState);

  const effectiveTabId = activeTabId || userLookupResult?.workspaces?.[0]?.id;
  const user = userLookupResult?.user;

  const userFullName = `${user?.firstName || ''} ${
    user?.lastName || ''
  }`.trim();

  const activeWorkspace = userLookupResult?.workspaces.find(
    (workspace) => workspace.id === effectiveTabId,
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

  const displayName = userFullName || userId || '';

  const userInfoItems = [
    {
      Icon: IconUser,
      label: t`Name`,
      value: userFullName,
    },
    {
      Icon: IconMail,
      label: t`Email`,
      value: user?.email,
    },
    {
      Icon: IconId,
      label: t`ID`,
      value: user?.id,
    },
    {
      Icon: IconCalendar,
      label: t`Created`,
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : '',
    },
    ...(currentUser?.canAccessFullAdminPanel && isDefined(userId)
      ? [
          {
            Icon: IconLock,
            label: t`Server access`,
            value: (
              <SettingsAdminServerAdminAccess
                userId={userId}
                userLabel={displayName}
              />
            ),
          },
        ]
      : []),
  ];

  const workspaceContent = (
    <SettingsAdminWorkspaceContent
      activeWorkspace={activeWorkspace}
      workspaceInfoActions={
        isDefined(activeWorkspace) &&
        isDefined(user) && (
          <SettingsAdminUserWorkspaceActions
            userId={user.id}
            workspace={activeWorkspace}
            memberName={displayName}
          />
        )
      }
    />
  );

  if (isLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <TabListRoot
      componentInstanceId={SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID}
    >
      <SettingsPageLayout
        title={displayName}
        icon={
          <Avatar
            name={displayName}
            colorSeed={user?.id}
            size="md"
            shape="circle"
          />
        }
        links={[
          {
            children: t`Other`,
            href: getSettingsPath(SettingsPath.AdminPanel),
          },
          {
            children: t`Admin Panel - General`,
            href: getSettingsPath(SettingsPath.AdminPanel),
          },
          {
            children: displayName,
          },
        ]}
        secondaryBar={
          tabs.length > 0 ? (
            <SettingsTabBar
              aria-label={t`User workspaces`}
              tabs={tabs}
              behaveAsLinks={false}
              componentInstanceId={SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID}
            />
          ) : undefined
        }
      >
        <SettingsPageContainer>
          {userLookupResult && (
            <>
              <Section.Root>
                <Section.Header
                  title={t`User Info`}
                  description={t`About this user`}
                />
                <SettingsTableCard
                  items={userInfoItems}
                  gridAutoColumns="1fr 4fr"
                />
              </Section.Root>
              {isNonEmptyArray(tabs) ? (
                <Tabs.Panel value={effectiveTabId ?? ''}>
                  {workspaceContent}
                </Tabs.Panel>
              ) : (
                workspaceContent
              )}
            </>
          )}
        </SettingsPageContainer>
      </SettingsPageLayout>
    </TabListRoot>
  );
};
