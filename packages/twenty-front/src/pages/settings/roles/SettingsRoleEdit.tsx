import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { SettingsRoleEditEffect } from '@/settings/roles/role/components/SettingsRoleEditEffect';
import { Navigate, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const SettingsRoleEdit = () => {
  const { roleId } = useParams();

  if (!isDefined(roleId)) {
    return <Navigate to="/settings/roles" />;
  }

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRoleEditEffect roleId={roleId} />
      <SettingsRole roleId={roleId ?? ''} isCreateMode={false} />
    </>
  );
};
