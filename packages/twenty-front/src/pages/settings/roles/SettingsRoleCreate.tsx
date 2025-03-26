import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { SettingsRoleCreateEffect } from '@/settings/roles/role/components/SettingsRoleCreateEffect';

export const SettingsRoleCreate = () => {
  const PENDING_ROLE_ID = 'pending-role-id';

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRoleCreateEffect roleId={PENDING_ROLE_ID} />
      <SettingsRole roleId={PENDING_ROLE_ID} isCreateMode={true} />
    </>
  );
};
