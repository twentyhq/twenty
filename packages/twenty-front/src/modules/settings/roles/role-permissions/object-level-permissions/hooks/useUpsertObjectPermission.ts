import { applyObjectPermissionChange } from '@/settings/roles/role-permissions/object-level-permissions/utils/applyObjectPermissionChange';
import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useUpsertObjectPermission = ({ roleId }: { roleId: string }) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const upsertObjectPermission = (
    objectMetadataItemId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
    value: boolean | null,
  ) => {
    const existingObjectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermissionToFind) =>
        objectPermissionToFind.objectMetadataId === objectMetadataItemId,
    );

    upsertObjectPermissionInDraftRole(
      applyObjectPermissionChange({
        objectPermission: existingObjectPermission ?? {
          objectMetadataId: objectMetadataItemId,
        },
        permissionKey,
        value,
      }),
    );
  };

  return {
    upsertObjectPermission,
  };
};
