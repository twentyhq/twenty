import { type FieldPermission } from '~/generated-metadata/graphql';

type FieldPermissionTarget = Pick<
  FieldPermission,
  'fieldMetadataId' | 'rowLevelPermissionPredicateGroupId'
>;

// A field has one permission for all records, plus one per rule that restricts it
export const isSameFieldPermissionTarget = ({
  firstFieldPermission,
  secondFieldPermission,
}: {
  firstFieldPermission: FieldPermissionTarget;
  secondFieldPermission: FieldPermissionTarget;
}) =>
  firstFieldPermission.fieldMetadataId ===
    secondFieldPermission.fieldMetadataId &&
  (firstFieldPermission.rowLevelPermissionPredicateGroupId ?? null) ===
    (secondFieldPermission.rowLevelPermissionPredicateGroupId ?? null);
