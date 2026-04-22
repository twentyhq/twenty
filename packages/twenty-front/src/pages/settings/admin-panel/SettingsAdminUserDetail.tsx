import { useParams } from 'react-router-dom';

import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import { getImageAbsoluteURI, getSettingsPath } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminUserLookupWorkspaceTabsId';
import { useHandleImpersonate } from '@/settings/admin-panel/hooks/useHandleImpersonate';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  H2Title,
  IconCalendar,
  IconEyeShare,
  IconId,
  IconMail,
  IconUser,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  type UserLookupAdminPanelQuery,
  UserLookupAdminPanelDocument,
} from '~/generated-admin/graphql';

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

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
  const { handleImpersonate, impersonatingUserId } = useHandleImpersonate();

  const effectiveTabId = activeTabId || userLookupResult?.workspaces?.[0]?.id;

  const userFullName = `${userLookupResult?.user.firstName || ''} ${
    userLookupResult?.user.lastName || ''
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
    {
      Icon: IconCalendar,
      label: t`Created`,
      value: userLookupResult?.user.createdAt
        ? new Date(userLookupResult.user.createdAt).toLocaleDateString()
        : '',
    },
  ];

  const displayName = userFullName || userId || '';

  if (isLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SubMenuTopBarContainer
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
    >
      <SettingsPageContainer>
        {userLookupResult && (
          <>
            <Section>
              <H2Title title={t`User Info`} description={t`About this user`} />
              <SettingsTableCard
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
                componentInstanceId={
                  SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID
                }
              />
              <SettingsAdminWorkspaceContent
                activeWorkspace={activeWorkspace}
              />
              {currentUser?.canImpersonate && activeWorkspace && (
                <StyledButtonContainer>
                  <Button
                    Icon={IconEyeShare}
                    variant="primary"
                    accent="default"
                    title={
                      activeWorkspace.allowImpersonation === false
                        ? t`Impersonation is disabled for this workspace`
                        : t`Impersonate`
                    }
                    onClick={() =>
                      handleImpersonate(
                        userLookupResult.user.id,
                        activeWorkspace.id,
                      )
                    }
                    disabled={
                      impersonatingUserId !== null ||
                      activeWorkspace.allowImpersonation === false
                    }
                  />
                </StyledButtonContainer>
              )}
            </Section>
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
