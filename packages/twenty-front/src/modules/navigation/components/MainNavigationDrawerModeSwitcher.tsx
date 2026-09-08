import { useLingui } from '@lingui/react/macro';
import {
  type IconComponent,
  IconComment,
  IconHome,
  IconSettings,
} from 'twenty-ui/icon';
import { NavigationModeSwitcher } from 'twenty-ui/navigation';

import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type NavigationDrawerMode = {
  Icon: IconComponent;
  label: string;
  mode: NavigationDrawerActiveTab;
};

export const MainNavigationDrawerModeSwitcher = () => {
  const { t } = useLingui();

  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const { switchNavigationDrawerMode } = useSwitchNavigationDrawerMode();

  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  // A suspended workspace is held on the billing settings by the route guard,
  // so offering the modes it would bounce back from only flashes the user out
  // and in again.
  if (isWorkspaceSuspended) {
    return null;
  }

  const modes: NavigationDrawerMode[] = [
    {
      Icon: IconHome,
      label: t`Home`,
      mode: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    },
    ...(hasAiPermission
      ? [
          {
            Icon: IconComment,
            label: t`AI`,
            mode: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
          },
        ]
      : []),
    {
      Icon: IconSettings,
      label: t`Settings`,
      mode: NAVIGATION_DRAWER_TABS.SETTINGS,
    },
  ];

  return (
    <NavigationDrawerAnimatedCollapseWrapper>
      <NavigationModeSwitcher
        ariaLabel={t`Navigation modes`}
        activeItemName={activeNavigationDrawerMode}
        items={modes.map(({ Icon, label, mode }) => ({
          Icon,
          label,
          name: mode,
          onClick: () => switchNavigationDrawerMode(mode),
        }))}
      />
    </NavigationDrawerAnimatedCollapseWrapper>
  );
};
