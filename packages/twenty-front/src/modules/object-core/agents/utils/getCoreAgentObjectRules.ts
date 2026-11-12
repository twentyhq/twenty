import {
  type FieldPermission,
  type RowLevelPermissionPredicate,
} from '~/generated-metadata/graphql';

type CoreAgentObjectRulesRole = {
  fieldPermissions?:
    | Pick<
        FieldPermission,
        'objectMetadataId' | 'canReadFieldValue' | 'canUpdateFieldValue'
      >[]
    | null;
  rowLevelPermissionPredicates?:
    | Pick<RowLevelPermissionPredicate, 'objectMetadataId'>[]
    | null;
};

export const getCoreAgentObjectRules = ({
  role,
  objectMetadataId,
}: {
  role: CoreAgentObjectRulesRole | undefined;
  objectMetadataId: string;
}) => {
  const objectFieldPermissions = (role?.fieldPermissions ?? []).filter(
    (fieldPermission) => fieldPermission.objectMetadataId === objectMetadataId,
  );

  return {
    hasRecordLevelFilter: (role?.rowLevelPermissionPredicates ?? []).some(
      (predicate) => predicate.objectMetadataId === objectMetadataId,
    ),
    unreadableFieldCount: objectFieldPermissions.filter(
      ({ canReadFieldValue }) => canReadFieldValue === false,
    ).length,
    readOnlyFieldCount: objectFieldPermissions.filter(
      ({ canReadFieldValue, canUpdateFieldValue }) =>
        canReadFieldValue !== false && canUpdateFieldValue === false,
    ).length,
  };
};
