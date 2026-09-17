import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceBillingContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceBillingContent';
import { SettingsAdminWorkspaceContent } from '@/settings/admin-panel/components/SettingsAdminWorkspaceContent';
import { SETTINGS_ADMIN_FEATURE_FLAG_METADATA } from '@/settings/admin-panel/constants/SettingsAdminFeatureFlagMetadata';
import { GET_ADMIN_WORKSPACE_CHAT_THREADS } from '@/settings/admin-panel/graphql/queries/getAdminWorkspaceChatThreads';
import { WORKSPACE_LOOKUP_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/workspaceLookupAdminPanel';
import { useAdminUpdateFeatureFlag } from '@/settings/admin-panel/hooks/useAdminUpdateFeatureFlag';
import { useHandleImpersonate } from '@/settings/admin-panel/hooks/useHandleImpersonate';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import {
  SettingsTableListSection,
  type SettingsTableListSectionColumn,
} from '@/settings/components/SettingsTableListSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconCreditCard,
  IconEyeShare,
  IconFlag,
  IconMessage,
  IconSettings2,
  IconUsers,
} from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button, Switch } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/primitives/layout';
import {
  Card,
  OverflowingTextWithTooltip,
} from 'twenty-ui/primitives/surfaces';
import { H2Title, Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetUpgradeStatusDocument,
  UpdateWorkspaceFeatureFlagDocument,
  type FeatureFlagKey,
  type GetAdminWorkspaceChatThreadsQuery,
  type WorkspaceLookupAdminPanelQuery,
} from '~/generated-admin/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

import { useToast } from 'twenty-ui/primitives/feedback';

const StyledFeatureFlagName = styled(Text)`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 0;
`;

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
  const labPublicFeatureFlags = useAtomStateValue(labPublicFeatureFlagsState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const canManageFeatureFlags = useAtomStateValue(canManageFeatureFlagsState);
  const { enqueueToast } = useToast();
  const { updateFeatureFlagState } = useAdminUpdateFeatureFlag();
  const { handleImpersonate, impersonatingUserId } = useHandleImpersonate();
  const [updateFeatureFlag] = useMutation(UpdateWorkspaceFeatureFlagDocument, {
    client: apolloAdminClient,
    refetchQueries: [
      { query: WORKSPACE_LOOKUP_ADMIN_PANEL, variables: { workspaceId } },
    ],
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
        enqueueToast({
          variant: 'error',
          children: `Failed to update feature flag. ${error.message}`,
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
  const workspaceLogo = isNonEmptyString(workspace?.logo)
    ? workspace.logo
    : DEFAULT_WORKSPACE_LOGO;

  const featureFlagItems = (workspace?.featureFlags ?? []).flatMap((flag) => {
    if (!isDefined(flag.key)) {
      return [];
    }

    const metadata = SETTINGS_ADMIN_FEATURE_FLAG_METADATA[flag.key];
    const publicMetadata = labPublicFeatureFlags.find(
      (publicFeatureFlag) => publicFeatureFlag.key === flag.key,
    )?.metadata;
    const currentWorkspaceValue =
      currentWorkspace?.id === workspaceId
        ? currentWorkspace?.featureFlags?.find(
            (featureFlag) => featureFlag.key === flag.key,
          )?.value
        : undefined;

    return [
      {
        id: flag.key,
        label:
          publicMetadata?.label ??
          (isDefined(metadata) ? t(metadata.label) : flag.key),
        description:
          publicMetadata?.description ??
          (isDefined(metadata) ? t(metadata.description) : ''),
        value: currentWorkspaceValue ?? flag.value,
      },
    ];
  });

  const featureFlagColumns: SettingsTableListSectionColumn<
    (typeof featureFlagItems)[number]
  >[] = [
    {
      label: t`Name`,
      overflow: 'hidden',
      Cell: ({ item }) => (
        <StyledFeatureFlagName>
          <OverflowingTextWithTooltip
            text={<>{item.label}</>}
            tooltipContent={item.id}
            tooltipPlace={'top'}
            alwaysShowTooltip
            isFocusable
          />
        </StyledFeatureFlagName>
      ),
    },
    {
      label: t`Description`,
      overflow: 'hidden',
      Cell: ({ item }) => (
        <OverflowingTextWithTooltip
          text={item.description}
          isTooltipMultiline
          isFocusable
        />
      ),
    },
    {
      label: t`Status`,
      align: 'right',
      Cell: ({ item }) => (
        <Switch
          aria-label={item.label}
          aria-description={item.description}
          checked={item.value}
          onCheckedChange={(newValue) =>
            handleFeatureFlagUpdate(item.id, newValue)
          }
        />
      ),
    },
  ];

  if (isLoadingWorkspace) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SettingsPageLayout
      title={workspaceName}
      icon={
        <Avatar
          src={getAbsoluteImageUrl(workspaceLogo)}
          name={workspaceName}
          colorSeed={workspace?.id}
          size="md"
        />
      }
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
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={WORKSPACE_DETAIL_TABS_ID}
        />
      }
    >
      <SettingsPageContainer>
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
                          src={getAbsoluteImageUrl(user.avatarUrl)}
                          name={
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                            user.email
                          }
                          colorSeed={user.id}
                          size="md"
                          shape="circle"
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
                        {workspace.allowImpersonation &&
                          isDefined(currentUser?.id) &&
                          userId !== currentUser.id && (
                            <Button
                              startIcon={<IconEyeShare />}
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleImpersonate(userId, workspaceId!);
                              }}
                              disabled={impersonatingUserId === userId}
                              variant="outline"
                            >{t`Impersonate`}</Button>
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
            <SettingsTableListSection
              title={t`Feature Flags`}
              description={t`Manage feature flags for this workspace`}
              gridAutoColumns="minmax(0, 240px) minmax(0, 1fr) 56px"
              items={featureFlagItems}
              columns={featureFlagColumns}
            />
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
                    <TableCell align="right">{thread.messageCount}</TableCell>
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
    </SettingsPageLayout>
  );
};
