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

export type NavigationDrawerMode = {
  Icon: IconComponent;
  label: string;
  mode: NavigationDrawerActiveTab;
};

export const useNavigationDrawerModes = (): NavigationDrawerMode[] => {
  const { t } = useLingui();

  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  // The route guard holds a suspended workspace on billing settings, so other modes would bounce back.
  if (isWorkspaceSuspended) {
    return [];
  }

  const navigationDrawerModeDisplays: Record<
    NavigationDrawerActiveTab,
    Omit<NavigationDrawerMode, 'mode'>
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
    (mode) =>
      mode !== NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY || hasAiPermission,
  ).map((mode) => ({ ...navigationDrawerModeDisplays[mode], mode }));
};
