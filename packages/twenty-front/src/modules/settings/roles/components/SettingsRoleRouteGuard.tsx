import { type ReactNode } from 'react';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SettingsRoleRouteGuard = ({
  roleId,
  children,
}: {
  roleId: string;
  children: ReactNode;
}) => {
  const settingsRoleIds = useAtomStateValue(settingsRoleIdsState);
  const settingsRolesIsLoading = useAtomStateValue(settingsRolesIsLoadingState);
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const isUnsavedRole =
    settingsDraftRole.id === roleId && !isDefined(settingsPersistedRole);

  const guardedChildren = settingsRolesIsLoading ? (
    <SettingsSkeletonLoader />
  ) : settingsRoleIds.includes(roleId) || isUnsavedRole ? (
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
