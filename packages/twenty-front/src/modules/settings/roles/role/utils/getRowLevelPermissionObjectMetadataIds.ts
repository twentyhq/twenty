import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

// An object with any predicate keeps its grants on its row level rule
export const getRowLevelPermissionObjectMetadataIds = (
  role:
    | Pick<RoleWithPartialMembers, 'rowLevelPermissionPredicates'>
    | undefined,
) =>
  new Set(
    (role?.rowLevelPermissionPredicates ?? []).map(
      ({ objectMetadataId }) => objectMetadataId,
    ),
  );
