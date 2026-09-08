import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';

export const useFieldPermissionTableColumns = ({
  roleId,
  objectMetadataItemId,
}: {
  roleId: string;
  objectMetadataItemId: string;
}) => {
  const { cannotAllowFieldReadRestrict, cannotAllowFieldUpdateRestrict } =
    useObjectPermissionDerivedStates({
      roleId,
      objectMetadataItemId,
    });

  const shouldShowSeeColumn = !cannotAllowFieldReadRestrict;

  const shouldShowUpdateColumn =
    !cannotAllowFieldReadRestrict && !cannotAllowFieldUpdateRestrict;

  return {
    shouldShowSeeColumn,
    shouldShowUpdateColumn,
  };
};
