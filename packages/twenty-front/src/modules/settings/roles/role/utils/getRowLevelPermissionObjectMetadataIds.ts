import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

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
