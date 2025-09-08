import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { SettingsRoleEditEffect } from '@/settings/roles/role/components/SettingsRoleEditEffect';
import { SettingsPath } from '@/types/SettingsPath';
import { Navigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { settingsPersistedRoleFamilyState } from '~/modules/settings/roles/states/settingsPersistedRoleFamilyState';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsRoleEdit = () => {
  const { roleId } = useParams();

  const persistedRole = useRecoilValue(
    settingsPersistedRoleFamilyState(roleId ?? ''),
  );

  if (!isDefined(roleId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

  const isCreateMode = !isDefined(persistedRole?.id);

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRoleEditEffect roleId={roleId} />
      <SettingsRole roleId={roleId} isCreateMode={isCreateMode} />
    </>
  );
};
