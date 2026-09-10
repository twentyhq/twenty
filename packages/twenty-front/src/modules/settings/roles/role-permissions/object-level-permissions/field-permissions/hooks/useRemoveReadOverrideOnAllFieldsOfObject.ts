import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { isFieldRestrictable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldRestrictable';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveReadOverrideOnAllFieldsOfObject = ({
  roleId,
}: {
  roleId: string;
}) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const removeReadOverrideOnAllFieldsOfObject = (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => {
    const existingFieldPermissionsForThisObject =
      settingsDraftRole.fieldPermissions?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.objectMetadataId === objectMetadataItem.id,
      ) ?? [];

    for (const fieldPermissionToChange of existingFieldPermissionsForThisObject) {
      const fieldMetadataItem = objectMetadataItem.fields.find(
        (fieldToFind) =>
          fieldToFind.id === fieldPermissionToChange.fieldMetadataId,
      );

      const canRestrictUpdate =
        isDefined(fieldMetadataItem) && isFieldRestrictable(fieldMetadataItem);

      upsertFieldPermissionInDraftRole({
        ...fieldPermissionToChange,
        canReadFieldValue: null,
        canUpdateFieldValue: canRestrictUpdate
          ? fieldPermissionToChange.canUpdateFieldValue
          : null,
      });
    }
  };

  return {
    removeReadOverrideOnAllFieldsOfObject,
  };
};
