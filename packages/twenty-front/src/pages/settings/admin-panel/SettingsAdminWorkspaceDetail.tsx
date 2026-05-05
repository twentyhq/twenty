import { useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceBillingContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceBillingContent';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { GET_ADMIN_WORKSPACE_CHAT_THREADS } from '@/settings/admin-panel/graphql/queries/getAdminWorkspaceChatThreads';
import { WORKSPACE_LOOKUP_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/workspaceLookupAdminPanel';
import { useFeatureFlagState } from '@/settings/admin-panel/hooks/useFeatureFlagState';
import { useHandleImpersonate } from '@/settings/admin-panel/hooks/useHandleImpersonate';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  Avatar,
  H2Title,
  IconCreditCard,
  IconEyeShare,
  IconFlag,
  IconMessage,
  OverflowingTextWithTooltip,
  IconSettings2,
  IconUsers,
} from 'twenty-ui/display';
import { Button, Toggle } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type FeatureFlagKey,
  type GetAdminWorkspaceChatThreadsQuery,
  type WorkspaceLookupAdminPanelQuery,
  GetUpgradeStatusDocument,
  UpdateWorkspaceFeatureFlagDocument,
} from '~/generated-admin/graphql';

const WORKSPACE_DETAIL_TABS_ID = 'settings-admin-workspace-detail-tabs';

const WORKSPACE_DETAIL_TAB_IDS = {
  INFO: 'info',
  BILLING: 'billing',
  MEMBERS: 'members',
  FEATURE_FLAGS: 'feature-flags',
  CHATS: 'chats',
};

export const SettingsAdminWorkspaceDetail = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const apolloAdminClient = useApolloAdminClient();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    WORKSPACE_DETAIL_TABS_ID,
  );

  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const canManageFeatureFlags = useAtomStateValue(canManageFeatureFlagsState);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { updateFeatureFlagState } = useFeatureFlagState();
  const { handleImpersonate, impersonatingUserId } = useHandleImpersonate();
  const [updateFeatureFlag] = useMutation(UpdateWorkspaceFeatureFlagDocument, {
    client: apolloAdminClient,
  });

  const { data: workspaceData, loading: isLoadingWorkspace } =
    useQuery<WorkspaceLookupAdminPanelQuery>(WORKSPACE_LOOKUP_ADMIN_PANEL, {
      client: apolloAdminClient,
      variables: { workspaceId },
      skip: !workspaceId,
    });

  const workspace = workspaceData?.workspaceLookupAdminPanel?.workspaces?.[0];

  const effectiveTabId = activeTabId || WORKSPACE_DETAIL_TAB_IDS.INFO;

  const { data: threadsData, loading: isLoadingThreads } =
    useQuery<GetAdminWorkspaceChatThreadsQuery>(
      GET_ADMIN_WORKSPACE_CHAT_THREADS,
      {
        client: apolloAdminClient,
        variables: { workspaceId },
        skip:
          !workspaceId ||
          !workspace?.allowImpersonation ||
          effectiveTabId !== WORKSPACE_DETAIL_TAB_IDS.CHATS,
      },
    );
  const { data: workspaceUpgradeStatusData } = useQuery(
    GetUpgradeStatusDocument,
    {
      client: apolloAdminClient,
      variables: { workspaceIds: workspaceId ? [workspaceId] : [] },
      skip: !workspaceId,
      fetchPolicy: 'network-only',
    },
  );

  const threads = threadsData?.getAdminWorkspaceChatThreads ?? [];

  const handleFeatureFlagUpdate = async (
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    if (!workspaceId) return;

    const previousValue = workspace?.featureFlags?.find(
      (flag) => flag.key === featureFlag,
    )?.value;

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

  const tabs = [
    {
      id: WORKSPACE_DETAIL_TAB_IDS.INFO,
      title: t`Info`,
      Icon: IconSettings2,
    },
    ...(isBillingEnabled
      ? [
          {
            id: WORKSPACE_DETAIL_TAB_IDS.BILLING,
            title: t`Billing`,
            Icon: IconCreditCard,
          },
        ]
      : []),
    ...(currentUser?.canImpersonate
      ? [
          {
            id: WORKSPACE_DETAIL_TAB_IDS.MEMBERS,
            title: t`Members`,
            Icon: IconUsers,
          },
        ]
      : []),
    ...(canManageFeatureFlags
      ? [
          {
            id: WORKSPACE_DETAIL_TAB_IDS.FEATURE_FLAGS,
            title: t`Feature Flags`,
            Icon: IconFlag,
          },
        ]
      : []),
    ...(workspace?.allowImpersonation
      ? [
          {
            id: WORKSPACE_DETAIL_TAB_IDS.CHATS,
            title: t`Chats`,
            Icon: IconMessage,
          },
        ]
      : []),
  ];

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
          children: t`Admin Panel - AI`,
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
          <SettingsAdminWorkspaceContent
            activeWorkspace={workspace}
            workspaceUpgradeStatus={workspaceUpgradeStatusData?.getUpgradeStatus?.find(
              (status) => status?.workspaceId === workspaceId,
            )}
          />
        )}

        {effectiveTabId === WORKSPACE_DETAIL_TAB_IDS.BILLING &&
          isBillingEnabled &&
          workspaceId && (
            <SettingsAdminWorkspaceBillingContent workspaceId={workspaceId} />
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
                      <TableCell
                        color={themeCssVariables.font.color.primary}
                        gap={themeCssVariables.spacing[2]}
                        overflow="hidden"
                      >
                        <Avatar
                          avatarUrl={user.avatarUrl}
                          placeholder={
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                            user.email
                          }
                          placeholderColorSeed={user.id}
                          size="md"
                          type="rounded"
                        />
                        <OverflowingTextWithTooltip
                          text={
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                            '\u2014'
                          }
                        />
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
                              handleImpersonate(userId, workspaceId!);
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
                  {workspace.featureFlags?.map((flag) => {
                    const currentWorkspaceValue =
                      currentWorkspace?.id === workspaceId
                        ? currentWorkspace?.featureFlags?.find(
                            (f) => f.key === flag.key,
                          )?.value
                        : undefined;
                    const displayedValue = currentWorkspaceValue ?? flag.value;
                    return (
                      <TableRow
                        gridAutoColumns="1fr 100px"
                        mobileGridAutoColumns="1fr 80px"
                        key={flag.key}
                      >
                        <TableCell>{flag.key}</TableCell>
                        <TableCell align="right">
                          {isDefined(flag.key) && (
                            <Toggle
                              value={displayedValue}
                              onChange={(newValue) =>
                                handleFeatureFlagUpdate(flag.key!, newValue)
                              }
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

        {effectiveTabId === WORKSPACE_DETAIL_TAB_IDS.CHATS && (
          <Section>
            <H2Title
              title={t`Chat Sessions`}
              description={t`AI chat threads for this workspace`}
            />
            {isLoadingThreads ? (
              <SettingsSectionSkeletonLoader />
            ) : threads.length === 0 ? (
              <Card rounded>
                <TableRow gridTemplateColumns="1fr">
                  <TableCell
                    color={themeCssVariables.font.color.tertiary}
                    align="center"
                  >
                    {t`No chat threads found.`}
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
