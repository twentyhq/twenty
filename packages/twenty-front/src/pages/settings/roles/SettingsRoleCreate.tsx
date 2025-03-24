import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { RolesQueryEffect } from '@/settings/roles/components/RolesQueryEffect';
import { Role } from '@/settings/roles/role/components/Role';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';

export const SettingsRoleCreate = () => {
  const newRoleId = uuidv4();

  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(newRoleId),
  );

  useEffect(() => {
    const newRole = {
      id: newRoleId,
      label: '',
      description: '',
      icon: 'IconUser',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      isEditable: true,
      workspaceMembers: [],
    };

    setSettingsDraftRole(newRole);
  }, [newRoleId, setSettingsDraftRole]);

  return (
    <>
      <RolesQueryEffect />
      <Role roleId={newRoleId} isCreateMode={true} />
    </>
  );
};
