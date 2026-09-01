import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { SettingsRoleCreateEffect } from '@/settings/roles/role/components/SettingsRoleCreateEffect';
import { useState } from 'react';
import { v4 } from 'uuid';

export const SettingsRoleCreate = () => {
  const [newRoleId] = useState(() => v4());

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRoleCreateEffect roleId={newRoleId} />
      <SettingsRole roleId={newRoleId} isCreateMode={true} />
    </>
  );
};
