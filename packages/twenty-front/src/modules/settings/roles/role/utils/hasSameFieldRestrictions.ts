import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type RoleFieldPermissions = Pick<RoleWithPartialMembers, 'fieldPermissions'>;

const getSortedFieldRestrictions = ({
  fieldPermissions,
}: RoleFieldPermissions) =>
  (fieldPermissions ?? [])
    .filter(
      ({ canReadFieldValue, canUpdateFieldValue }) =>
        canReadFieldValue === false || canUpdateFieldValue === false,
    )
    .map(
      (fieldPermission) =>
        `${fieldPermission.fieldMetadataId}:${fieldPermission.canReadFieldValue === false}:${fieldPermission.canUpdateFieldValue === false}`,
    )
    .sort();

export const hasSameFieldRestrictions = ({
  firstRole,
  secondRole,
}: {
  firstRole: RoleFieldPermissions;
  secondRole: RoleFieldPermissions;
}) =>
  isDeeplyEqual(
    getSortedFieldRestrictions(firstRole),
    getSortedFieldRestrictions(secondRole),
  );
