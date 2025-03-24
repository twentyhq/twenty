import { RolesQueryEffect } from '@/settings/roles/components/RolesQueryEffect';
import { Role } from '@/settings/roles/role/components/Role';
import { RoleEffect } from '@/settings/roles/role/components/RoleEffect';
import { useParams } from 'react-router-dom';

export const SettingsRoleEdit = () => {
  const { roleId = '' } = useParams();

  return (
    <>
      <RolesQueryEffect />
      <RoleEffect roleId={roleId} />
      <Role roleId={roleId} isCreateMode={false} />
    </>
  );
};
