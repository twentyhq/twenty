import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useSetObjectActionPermissions = (roleId: string) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const setObjectActionPermissions = ({
    objectMetadataId,
    actionPermissions,
  }: {
    objectMetadataId: string;
    actionPermissions: SettingsRoleObjectActionPermissions;
  }) => {
    const existingObjectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermissionToFind) =>
        objectPermissionToFind.objectMetadataId === objectMetadataId,
    );

    upsertObjectPermissionInDraftRole({
      ...existingObjectPermission,
      objectMetadataId,
      ...actionPermissions,
    });
  };

  return { setObjectActionPermissions };
};
