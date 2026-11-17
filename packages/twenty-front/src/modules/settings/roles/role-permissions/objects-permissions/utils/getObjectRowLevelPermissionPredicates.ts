import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

// Related record paths are edited from the object settings, not from the role page
export const getObjectRowLevelPermissionPredicates = ({
  role,
  objectMetadataId,
}: {
  role: Pick<RoleWithPartialMembers, 'rowLevelPermissionPredicates'>;
  objectMetadataId: string;
}) =>
  (role.rowLevelPermissionPredicates ?? []).filter(
    (predicate) =>
      predicate.objectMetadataId === objectMetadataId &&
      !isDefined(predicate.relationFieldMetadataId),
  );
