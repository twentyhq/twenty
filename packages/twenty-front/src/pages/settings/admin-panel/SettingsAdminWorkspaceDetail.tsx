import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { GET_ADMIN_WORKSPACE_CHAT_THREADS } from '@/settings/admin-panel/graphql/queries/getAdminWorkspaceChatThreads';
import { WORKSPACE_LOOKUP_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/workspaceLookupAdminPanel';
import { useFeatureFlagState } from '@/settings/admin-panel/hooks/useFeatureFlagState';
import { useImpersonationSession } from '@/auth/hooks/useImpersonationSession';
import { useImpersonationRedirect } from '@/settings/admin-panel/hooks/useImpersonationRedirect';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { type AdminChatThread } from '@/settings/admin-panel/types/AdminChatThread';
import { type UserLookup } from '@/settings/admin-panel/types/UserLookup';
import { type WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  H2Title,
  IconEyeShare,
  IconFlag,
  IconMessage,
  IconSettings2,
  IconUsers,
} from 'twenty-ui/display';
import { Button, Toggle } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type FeatureFlagKey,
  ImpersonateDocument,
  UpdateWorkspaceFeatureFlagDocument,
} from '~/generated-metadata/graphql';

const WORKSPACE_DETAIL_TABS_ID = 'settings-admin-workspace-detail-tabs';

const WORKSPACE_DETAIL_TAB_IDS = {
  INFO: 'info',
  MEMBERS: 'members',
  FEATURE_FLAGS: 'feature-flags',
  CHATS: 'chats',
};

export const SettingsAdminWorkspaceDetail = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [activeTabId] = useAtomComponentState(
    activeTabIdComponentState,
    WORKSPACE_DETAIL_TABS_ID,
  );

  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const canManageFeatureFlags = useAtomStateValue(canManageFeatureFlagsState);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [updateFeatureFlag] = useMutation(UpdateWorkspaceFeatureFlagDocument);
  const { updateFeatureFlagState } = useFeatureFlagState();
  const { startImpersonating } = useImpersonationSession();
  const { executeImpersonationRedirect } = useImpersonationRedirect();
  const [impersonate] = useMutation(ImpersonateDocument);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(
    null,
  );

  const [, setUserLookupResult] = useAtomState(userLookupResultState);
  const userLookupResult = useAtomStateValue(userLookupResultState);

  const { data: workspaceData, loading: isLoadingWorkspace } = useQuery<{
    workspaceLookupAdminPanel: UserLookup;
  }>(WORKSPACE_LOOKUP_ADMIN_PANEL, {
    variables: { workspaceId },
    skip: !workspaceId,
  });

  useEffect(() => {
    if (isDefined(workspaceData?.workspaceLookupAdminPanel)) {
      setUserLookupResult(workspaceData.workspaceLookupAdminPanel);
    }
  }, [workspaceData, setUserLookupResult]);

  const workspace = workspaceData?.workspaceLookupAdminPanel
    ?.workspaces?.[0] as WorkspaceInfo | undefined;

  const effectiveTabId = activeTabId || WORKSPACE_DETAIL_TAB_IDS.INFO;

  const { data: threadsData, loading: isLoadingThreads } = useQuery<{
    getAdminWorkspaceChatThreads: AdminChatThread[];
  }>(GET_ADMIN_WORKSPACE_CHAT_THREADS, {
    variables: { workspaceId },
    skip:
      !workspaceId ||
      !workspace?.allowImpersonation ||
      effectiveTabId !== WORKSPACE_DETAIL_TAB_IDS.CHATS,
  });

  const threads = threadsData?.getAdminWorkspaceChatThreads ?? [];

  const handleImpersonate = async (userId: string) => {
    if (!workspaceId) return;

    setImpersonatingUserId(userId);

    await impersonate({
      variables: { userId, workspaceId },
      onCompleted: async (data) => {
        const { loginToken, workspace: impersonatedWorkspace } =
          data.impersonate;
        const isCurrentWorkspace =
          impersonatedWorkspace.id === currentWorkspace?.id;

        if (isCurrentWorkspace) {
          await startImpersonating(loginToken.token);
          return;
        }

        return executeImpersonationRedirect(
          impersonatedWorkspace.workspaceUrls,
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
      setImpersonatingUserId(null);
    });
  };

  const handleFeatureFlagUpdate = async (
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    if (!workspaceId) return;

    const previousValue = userLookupResult?.workspaces
      .find((ws) => ws.id === workspaceId)
      ?.featureFlags.find((flag) => flag.key === featureFlag)?.value;

    updateFeatureFlagState(workspaceId, featureFlag, value);
    await updateFeatureFlag({
      variables: {
        workspaceId,
        featureFlag,
        value,
      },
      onError: (error) => {
        if (isDefined(previousValue)) {
          updateFeatureFlagState(workspaceId, featureFlag, previousValue);
        }
        enqueueErrorSnackBar({
          message: `Failed to update feature flag. ${error.message}`,
        });
      },
    });
  };

  const tabs = useMemo(() => {
    const result = [
      {
        id: WORKSPACE_DETAIL_TAB_IDS.INFO,
        title: t`Info`,
        Icon: IconSettings2,
      },
    ];

    if (currentUser?.canImpersonate) {
      result.push({
        id: WORKSPACE_DETAIL_TAB_IDS.MEMBERS,
        title: t`Members`,
        Icon: IconUsers,
      });
    }

    if (canManageFeatureFlags) {
      result.push({
        id: WORKSPACE_DETAIL_TAB_IDS.FEATURE_FLAGS,
        title: t`Feature Flags`,
        Icon: IconFlag,
      });
    }

    if (workspace?.allowImpersonation) {
      result.push({
        id: WORKSPACE_DETAIL_TAB_IDS.CHATS,
        title: t`Chats`,
        Icon: IconMessage,
      });
    }

    return result;
  }, [
    workspace?.allowImpersonation,
    canManageFeatureFlags,
    currentUser?.canImpersonate,
  ]);

  const workspaceName = workspace?.name || workspaceId || '';

  if (isLoadingWorkspace) {
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
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`AI`,
          href: AI_ADMIN_PATH,
        },
        {
          children: workspaceName,
        },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={WORKSPACE_DETAIL_TABS_ID}
        />

        {effectiveTabId === WORKSPACE_DETAIL_TAB_IDS.INFO && workspace && (
          <SettingsAdminWorkspaceContent activeWorkspace={workspace} />
        )}

        {effectiveTabId === WORKSPACE_DETAIL_TAB_IDS.MEMBERS && workspace && (
          <Section>
            <H2Title title={t`Members`} description={t`Workspace members`} />
            <Table>
              <TableBody>
                <TableRow gridTemplateColumns="1fr 2fr 100px">
                  <TableHeader>{t`Name`}</TableHeader>
                  <TableHeader>{t`Email`}</TableHeader>
                  <TableHeader align="right">{t`Actions`}</TableHeader>
                </TableRow>
                {workspace.users?.map((user) => {
                  const userId = user.id;

                  if (!isDefined(userId)) return null;

                  return (
                    <TableRow
                      key={userId}
                      gridTemplateColumns="1fr 2fr 100px"
                      to={getSettingsPath(SettingsPath.AdminPanelUserDetail, {
                        userId,
                      })}
                    >
                      <TableCell color={themeCssVariables.font.color.primary}>
                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                          '\u2014'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="right">
                        {workspace.allowImpersonation && (
                          <Button
                            Icon={IconEyeShare}
                            variant="secondary"
                            size="small"
                            title={t`Impersonate`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleImpersonate(userId);
                            }}
                            disabled={impersonatingUserId === userId}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Section>
        )}

        {effectiveTabId === WORKSPACE_DETAIL_TAB_IDS.FEATURE_FLAGS &&
          workspace && (
            <Section>
              <H2Title
                title={t`Feature Flags`}
                description={t`Manage feature flags for this workspace`}
              />
              <Table>
                <TableBody>
                  <TableRow
                    gridAutoColumns="1fr 100px"
                    mobileGridAutoColumns="1fr 80px"
                  >
                    <TableHeader>{t`Feature Flag`}</TableHeader>
                    <TableHeader align="right">{t`Status`}</TableHeader>
                  </TableRow>
                  {workspace.featureFlags?.map((flag) => (
                    <TableRow
                      gridAutoColumns="1fr 100px"
                      mobileGridAutoColumns="1fr 80px"
                      key={flag.key}
                    >
                      <TableCell>{flag.key}</TableCell>
                      <TableCell align="right">
                        {isDefined(flag.key) && (
                          <Toggle
                            value={flag.value}
                            onChange={(newValue) =>
                              handleFeatureFlagUpdate(flag.key!, newValue)
                            }
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          )}

        {effectiveTabId === WORKSPACE_DETAIL_TAB_IDS.CHATS && (
          <Section>
            <H2Title
              title={t`Chat Sessions`}
              description={t`AI chat threads for this workspace`}
            />
            {threads.length === 0 ? (
              <Card rounded>
                <TableRow gridTemplateColumns="1fr">
                  <TableCell
                    color={themeCssVariables.font.color.tertiary}
                    align="center"
                  >
                    {isLoadingThreads
                      ? t`Loading...`
                      : t`No chat threads found.`}
                  </TableCell>
                </TableRow>
              </Card>
            ) : (
              <Table>
                <TableRow gridTemplateColumns="1fr 120px 120px">
                  <TableHeader>{t`Title`}</TableHeader>
                  <TableHeader align="right">{t`Messages`}</TableHeader>
                  <TableHeader align="right">{t`Updated`}</TableHeader>
                </TableRow>
                {threads.map((thread) => (
                  <TableRow
                    key={thread.id}
                    gridTemplateColumns="1fr 120px 120px"
                    to={getSettingsPath(
                      SettingsPath.AdminPanelWorkspaceChatThread,
                      {
                        workspaceId: workspaceId ?? '',
                        threadId: thread.id,
                      },
                    )}
                  >
                    <TableCell color={themeCssVariables.font.color.primary}>
                      {thread.title || t`Untitled`}
                    </TableCell>
                    <TableCell align="right">
                      {thread.conversationSize}
                    </TableCell>
                    <TableCell align="right">
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            )}
          </Section>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
