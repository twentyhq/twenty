import { useLingui } from '@lingui/react/macro';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  type IconComponent,
  IconComment,
  IconHome,
  IconSettings,
} from 'twenty-ui/icon';

import { NAVIGATION_DRAWER_MODE_ORDER } from '@/navigation/constants/NavigationDrawerModeOrder';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export type NavigationDrawerMode = {
  Icon: IconComponent;
  label: string;
  mode: NavigationDrawerActiveTab;
};

export const useNavigationDrawerModes = (): NavigationDrawerMode[] => {
  const { t } = useLingui();

  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  // A suspended workspace is held on the billing settings by the route guard,
  // so offering the modes it would bounce back from only flashes the user out
  // and in again.
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
    [NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY]: {
      Icon: IconComment,
      label: t`AI`,
    },
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
