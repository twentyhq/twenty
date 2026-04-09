import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreateObjectPermissionInput } from 'src/engine/metadata-modules/object-permission/dtos/create-object-permission.input';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';

export const fromCreateObjectPermissionInputToUniversalFlatObjectPermission = ({
  createObjectPermissionInput,
  flatApplication,
  flatRoleMaps,
  flatObjectMetadataMaps,
}: {
  createObjectPermissionInput: CreateObjectPermissionInput;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleMaps' | 'flatObjectMetadataMaps'
>): UniversalFlatObjectPermission & { id: string } => {
  const {
    roleId,
    objectMetadataId,
    canReadObjectRecords,
    canUpdateObjectRecords,
    canSoftDeleteObjectRecords,
    canDestroyObjectRecords,
    universalIdentifier,
  } = createObjectPermissionInput;
  const now = new Date().toISOString();

  const { roleUniversalIdentifier, objectMetadataUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      metadataName: 'objectPermission',
      foreignKeyValues: { roleId, objectMetadataId },
      flatEntityMaps: {
        flatRoleMaps,
        flatObjectMetadataMaps,
      },
    });
  return {
    id: v4(),
    universalIdentifier: universalIdentifier ?? v4(),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    canReadObjectRecords: canReadObjectRecords ?? undefined,
    canUpdateObjectRecords: canUpdateObjectRecords ?? undefined,
    canSoftDeleteObjectRecords: canSoftDeleteObjectRecords ?? undefined,
    canDestroyObjectRecords: canDestroyObjectRecords ?? undefined,
    createdAt: now,
    updatedAt: now,
  };
};
