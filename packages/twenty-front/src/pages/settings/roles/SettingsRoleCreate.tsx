import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { SettingsRoleCreateEffect } from '@/settings/roles/role/components/SettingsRoleCreateEffect';

export const SettingsRoleCreate = () => {
  const newRoleId = crypto.randomUUID();

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRoleCreateEffect roleId={newRoleId} />
      <SettingsRole roleId={newRoleId} isCreateMode={true} />
    </>
  );
};
