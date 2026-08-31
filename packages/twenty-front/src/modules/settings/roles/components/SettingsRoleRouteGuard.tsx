import { type ReactNode } from 'react';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsRoleRouteGuard = ({
  roleId,
  children,
}: {
  roleId: string;
  children: ReactNode;
}) => {
  const workspaceSurface = useWorkspaceSurface();
  const settingsRoleIds = useAtomStateValue(settingsRoleIdsState);
  const settingsRolesIsLoading = useAtomStateValue(settingsRolesIsLoadingState);

  const guardedChildren =
    workspaceSurface.type !== 'side-panel' ? (
      children
    ) : settingsRolesIsLoading ? (
      <SettingsSkeletonLoader />
    ) : settingsRoleIds.includes(roleId) ? (
      children
    ) : (
      <WorkspaceRouteUnavailable />
    );

  return (
    <>
      <SettingsRolesQueryEffect />
      {guardedChildren}
    </>
  );
};
