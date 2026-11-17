import { useLingui } from '@lingui/react/macro';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  IconComment,
  type IconComponent,
  IconHome,
  IconInbox,
  IconSettings,
} from 'twenty-ui/icon';

import { NAVIGATION_DRAWER_MODE_ORDER } from '@/navigation/constants/NavigationDrawerModeOrder';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export type NavigationDrawerTabOption = {
  Icon: IconComponent;
  label: string;
  tab: NavigationDrawerActiveTab;
};

export const useNavigationDrawerTabs = (): NavigationDrawerTabOption[] => {
  const { t } = useLingui();

  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  // The route guard holds a suspended workspace on billing settings, so other tabs would bounce back.
  if (isWorkspaceSuspended) {
    return [];
  }

  const navigationDrawerTabDisplays: Record<
    NavigationDrawerActiveTab,
    Omit<NavigationDrawerTabOption, 'tab'>
  > = {
    [NAVIGATION_DRAWER_TABS.NAVIGATION_MENU]: {
      Icon: IconHome,
      label: t`Home`,
    },
    [NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY]: isAiChatInboxEnabled
      ? { Icon: IconInbox, label: t`Inbox` }
      : { Icon: IconComment, label: t`AI` },
    [NAVIGATION_DRAWER_TABS.SETTINGS]: {
      Icon: IconSettings,
      label: t`Settings`,
    },
  };

  return NAVIGATION_DRAWER_MODE_ORDER.filter(
    (tab) => tab !== NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY || hasAiPermission,
  ).map((tab) => ({ ...navigationDrawerTabDisplays[tab], tab }));
};
