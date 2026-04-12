import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import {
  getImageAbsoluteURI,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID } from '@/settings/admin-panel/constants/SettingsAdminUserLookupWorkspaceTabsId';
import { useImpersonationSession } from '@/auth/hooks/useImpersonationSession';
import { useImpersonationRedirect } from '@/settings/admin-panel/hooks/useImpersonationRedirect';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
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
  ImpersonateDocument,
  UserLookupAdminPanelDocument,
} from '~/generated-metadata/graphql';

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

export const SettingsAdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();

  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    SETTINGS_ADMIN_USER_LOOKUP_WORKSPACE_TABS_ID,
  );

  const [userLookupResult, setUserLookupResult] = useAtomState(
    userLookupResultState,
  );

  const [userLookup, { loading: isLoading }] = useMutation(
    UserLookupAdminPanelDocument,
  );

  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { startImpersonating } = useImpersonationSession();
  const { executeImpersonationRedirect } = useImpersonationRedirect();
  const [impersonate] = useMutation(ImpersonateDocument);
  const [isImpersonateLoading, setIsImpersonateLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    userLookup({
      variables: { userIdentifier: userId },
      onCompleted: (data) => {
        if (isDefined(data?.userLookupAdminPanel)) {
          setUserLookupResult(data.userLookupAdminPanel);

          if (data.userLookupAdminPanel.workspaces.length > 0 && !activeTabId) {
            setActiveTabId(data.userLookupAdminPanel.workspaces[0].id);
          }
        }
      },
    });
  }, [userId, userLookup, setUserLookupResult, setActiveTabId, activeTabId]);

  const handleImpersonate = async (workspaceId: string) => {
    if (!userLookupResult?.user.id) {
      return;
    }

    setIsImpersonateLoading(true);

    await impersonate({
      variables: { userId: userLookupResult.user.id, workspaceId },
      onCompleted: async (data) => {
        const { loginToken, workspace } = data.impersonate;
        const isCurrentWorkspace = workspace.id === currentWorkspace?.id;

        if (isCurrentWorkspace) {
          await startImpersonating(loginToken.token);
          return;
        }

        return executeImpersonationRedirect(
          workspace.workspaceUrls,
          loginToken.token,
          '_blank',
        );
      },
      onError: (error) => {
        enqueueErrorSnackBar({
          message: `Failed to impersonate user. ${error.message}`,
        });
      },
    }).finally(() => {
      setIsImpersonateLoading(false);
    });
  };

  const userFullName = `${userLookupResult?.user.firstName || ''} ${
    userLookupResult?.user.lastName || ''
  }`.trim();

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

  if (isLoading && !userLookupResult) {
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
        {isDefined(userLookupResult) && (
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
                    onClick={() => handleImpersonate(activeWorkspace.id)}
                    disabled={
                      isImpersonateLoading ||
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
