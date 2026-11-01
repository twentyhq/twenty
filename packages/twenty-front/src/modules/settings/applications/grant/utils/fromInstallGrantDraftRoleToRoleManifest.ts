import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  materializeRoleManifestObjectPermissions,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Drafts reference metadata ids; the install mutation takes universal identifiers. Requested rows
// for objects the editor can't show (the app's own objects) are kept as requested.
export const fromInstallGrantDraftRoleToRoleManifest = ({
  draftRole,
  requestedRoleManifest,
  objectMetadataItems,
}: {
  draftRole: RoleWithPartialMembers;
  requestedRoleManifest: RoleManifest;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'universalIdentifier' | 'fields'
  >[];
}): RoleManifest => {
  const objectUniversalIdentifierById = new Map(
    objectMetadataItems.map(({ id, universalIdentifier }) => [
      id,
      universalIdentifier,
    ]),
  );
  const fieldUniversalIdentifierById = new Map(
    objectMetadataItems.flatMap(({ fields }) =>
      fields.map(({ id, universalIdentifier }) => [id, universalIdentifier]),
    ),
  );
  const existingObjectUniversalIdentifiers = new Set(
    objectUniversalIdentifierById.values(),
  );

  const getObjectUniversalIdentifier = (objectMetadataId: string) =>
    objectUniversalIdentifierById.get(objectMetadataId) ?? objectMetadataId;
  const getFieldUniversalIdentifier = (fieldMetadataId: string) =>
    fieldUniversalIdentifierById.get(fieldMetadataId) ?? fieldMetadataId;
  const getOptionalFieldUniversalIdentifier = (
    fieldMetadataId: string | null | undefined,
  ) =>
    isDefined(fieldMetadataId)
      ? getFieldUniversalIdentifier(fieldMetadataId)
      : null;

  const rowsForObjectsNotInWorkspace = (
    materializeRoleManifestObjectPermissions(requestedRoleManifest)
      .objectPermissions ?? []
  ).filter(
    ({ objectUniversalIdentifier }) =>
      !existingObjectUniversalIdentifiers.has(objectUniversalIdentifier),
  );

  return {
    ...requestedRoleManifest,
    canReadAllObjectRecords: draftRole.canReadAllObjectRecords,
    canUpdateAllObjectRecords: draftRole.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords: draftRole.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: draftRole.canDestroyAllObjectRecords,
    objectPermissions: [
      ...rowsForObjectsNotInWorkspace,
      ...(draftRole.objectPermissions ?? []).map(
        ({ objectMetadataId, ...actions }) => ({
          objectUniversalIdentifier:
            getObjectUniversalIdentifier(objectMetadataId),
          canReadObjectRecords: actions.canReadObjectRecords ?? undefined,
          canUpdateObjectRecords: actions.canUpdateObjectRecords ?? undefined,
          canSoftDeleteObjectRecords:
            actions.canSoftDeleteObjectRecords ?? undefined,
          canDestroyObjectRecords: actions.canDestroyObjectRecords ?? undefined,
        }),
      ),
    ],
    fieldPermissions: (draftRole.fieldPermissions ?? []).map(
      (fieldPermission) => ({
        objectUniversalIdentifier: getObjectUniversalIdentifier(
          fieldPermission.objectMetadataId,
        ),
        fieldUniversalIdentifier: getFieldUniversalIdentifier(
          fieldPermission.fieldMetadataId,
        ),
        canReadFieldValue: fieldPermission.canReadFieldValue ?? undefined,
        canUpdateFieldValue: fieldPermission.canUpdateFieldValue ?? undefined,
      }),
    ),
    rowLevelPermissionPredicateGroups: (
      draftRole.rowLevelPermissionPredicateGroups ?? []
    ).map((predicateGroup) => ({
      universalIdentifier: predicateGroup.id,
      objectUniversalIdentifier: getObjectUniversalIdentifier(
        predicateGroup.objectMetadataId,
      ),
      logicalOperator: predicateGroup.logicalOperator,
      parentPredicateGroupUniversalIdentifier:
        predicateGroup.parentRowLevelPermissionPredicateGroupId,
      position: predicateGroup.positionInRowLevelPermissionPredicateGroup,
    })),
    rowLevelPermissionPredicates: (
      draftRole.rowLevelPermissionPredicates ?? []
    ).map((predicate) => ({
      universalIdentifier: predicate.id,
      objectUniversalIdentifier: getObjectUniversalIdentifier(
        predicate.objectMetadataId,
      ),
      fieldUniversalIdentifier: getFieldUniversalIdentifier(
        predicate.fieldMetadataId,
      ),
      operand: predicate.operand,
      value: predicate.value,
      subFieldName: predicate.subFieldName,
      workspaceMemberFieldUniversalIdentifier:
        getOptionalFieldUniversalIdentifier(
          predicate.workspaceMemberFieldMetadataId,
        ),
      workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName,
      predicateGroupUniversalIdentifier:
        predicate.rowLevelPermissionPredicateGroupId,
      position: predicate.positionInRowLevelPermissionPredicateGroup,
    })),
  };
};
