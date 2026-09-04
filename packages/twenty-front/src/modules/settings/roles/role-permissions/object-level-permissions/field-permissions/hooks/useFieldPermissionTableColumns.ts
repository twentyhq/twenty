import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';

// The grid always reserves both checkbox columns, so a hidden one needs a filler
// cell in the header, the All row and every field row, or they stop short of the
// table width and the header border no longer spans it
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
