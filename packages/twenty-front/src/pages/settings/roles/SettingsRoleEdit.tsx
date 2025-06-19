import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { SettingsRoleEditEffect } from '@/settings/roles/role/components/SettingsRoleEditEffect';
import { SettingsPath } from '@/types/SettingsPath';
import { Navigate, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsRoleEdit = () => {
  const { roleId } = useParams();

  if (!isDefined(roleId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRoleEditEffect roleId={roleId} />
      <SettingsRole roleId={roleId} isCreateMode={false} />
    </>
  );
};
