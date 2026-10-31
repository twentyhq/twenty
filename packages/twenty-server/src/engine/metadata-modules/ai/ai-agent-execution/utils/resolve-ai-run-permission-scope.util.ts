import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { type AiRunScope } from 'twenty-shared/ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { hasRoleWideAccessToPermissionFlag } from 'src/engine/metadata-modules/permissions/utils/has-role-wide-access-to-permission-flag.util';
import { buildResolveMorphRelationPermissionFieldIds } from 'src/engine/metadata-modules/role/utils/build-resolve-morph-relation-permission-field-ids.util';
import { computeObjectsPermissionsForRoleDefinition } from 'src/engine/metadata-modules/role/utils/compute-objects-permissions-for-role-definition.util';
import { type PermissionScope } from 'src/engine/twenty-orm/types/permission-scope.type';

// an entry naming an object or field the workspace does not have grants nothing
export const resolveAiRunPermissionScope = ({
  scope,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  scope: AiRunScope;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): PermissionScope => {
  const findObjectMetadataId = (objectUniversalIdentifier: string) =>
    flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier]?.id;
  const findFieldMetadataId = (fieldUniversalIdentifier: string) =>
    flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier]?.id;

  const roleWideAccess = {
    canUpdateAllSettings: scope.canUpdateAllSettings ?? false,
    canAccessAllTools: scope.canAccessAllTools ?? false,
  };
  const permissionFlagUniversalIdentifiers = new Set(
    scope.permissionFlagUniversalIdentifiers ?? [],
  );
  const isPermissionFlagGranted = (permissionFlag: PermissionFlagType) =>
    hasRoleWideAccessToPermissionFlag({
      role: roleWideAccess,
      permissionFlag,
    }) ||
    permissionFlagUniversalIdentifiers.has(
      SystemPermissionFlag[permissionFlag],
    );

  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const objectsPermissions = computeObjectsPermissionsForRoleDefinition({
    roleDefinition: {
      canReadAllObjectRecords: scope.canReadAllObjectRecords ?? false,
      canUpdateAllObjectRecords: scope.canUpdateAllObjectRecords ?? false,
      canSoftDeleteAllObjectRecords:
        scope.canSoftDeleteAllObjectRecords ?? false,
      canDestroyAllObjectRecords: scope.canDestroyAllObjectRecords ?? false,
      isPermissionFlagGranted,
      objectPermissions: (scope.objectPermissions ?? []).flatMap(
        ({ objectUniversalIdentifier, ...objectPermission }) => {
          const objectMetadataId = findObjectMetadataId(
            objectUniversalIdentifier,
          );

          return isDefined(objectMetadataId)
            ? [{ ...objectPermission, objectMetadataId }]
            : [];
        },
      ),
      fieldPermissions: (scope.fieldPermissions ?? []).flatMap(
        ({
          objectUniversalIdentifier,
          fieldUniversalIdentifier,
          ...fieldPermission
        }) => {
          const objectMetadataId = findObjectMetadataId(
            objectUniversalIdentifier,
          );
          const fieldMetadataId = findFieldMetadataId(fieldUniversalIdentifier);

          return isDefined(objectMetadataId) && isDefined(fieldMetadataId)
            ? [{ ...fieldPermission, objectMetadataId, fieldMetadataId }]
            : [];
        },
      ),
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
    objectMetadataCollection: Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined),
    resolveMorphRelationPermissionFieldIds:
      buildResolveMorphRelationPermissionFieldIds(
        flatFieldMetadatas.filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION,
        ),
      ),
  });

  return {
    objectsPermissions,
    grantedPermissionFlags: Object.values(PermissionFlagType).filter(
      isPermissionFlagGranted,
    ),
  };
};
