import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { SettingsRoleEditEffect } from '@/settings/roles/role/components/SettingsRoleEditEffect';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { settingsPersistedRoleFamilyState } from '~/modules/settings/roles/states/settingsPersistedRoleFamilyState';

export const SettingsRoleEdit = () => {
  const { roleId } = useParams();

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId ?? '',
  );

  if (!isDefined(roleId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

  const isCreateMode = !isDefined(settingsPersistedRole?.id);

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRoleEditEffect roleId={roleId} />
      <SettingsRole roleId={roleId} isCreateMode={isCreateMode} />
    </>
  );
};
