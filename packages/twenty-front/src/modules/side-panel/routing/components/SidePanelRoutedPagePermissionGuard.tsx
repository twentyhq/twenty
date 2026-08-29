import { type ReactNode } from 'react';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SidePanelRoutedPageUnavailable } from '@/side-panel/routing/components/SidePanelRoutedPageUnavailable';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

type SidePanelRoutedPagePermissionGuardProps = {
  settingsPermission?: PermissionFlagType;
  children: ReactNode;
};

// The main route tree gates these pages with SettingsProtectedRouteWrapper,
// which redirects on failure. The panel renders a message instead, since
// redirecting here would take the main outlet with it.
export const SidePanelRoutedPagePermissionGuard = ({
  settingsPermission,
  children,
}: SidePanelRoutedPagePermissionGuardProps) => {
  const hasPermission = useHasPermissionFlag(settingsPermission);

  if (!hasPermission) {
    return <SidePanelRoutedPageUnavailable />;
  }

  return <>{children}</>;
};
