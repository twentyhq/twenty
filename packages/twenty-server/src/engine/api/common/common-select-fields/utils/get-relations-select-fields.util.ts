import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAllSelectableFields } from 'src/engine/api/common/common-select-fields/utils/get-all-selectable-fields.util';
import { getIsFlatFieldAJoinColumn } from 'src/engine/api/common/common-select-fields/utils/get-is-flat-field-a-join-column.util';
import { getIsFlatFieldAJunctionRelationField } from 'src/engine/api/common/common-select-fields/utils/get-is-flat-field-a-junction-relation-field';
import { CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { MAX_DEPTH } from 'src/engine/api/rest/input-request-parsers/constants/max-depth.constant';
import { Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type RelationsSelectFlatObjectMetadata = Pick<
  FlatObjectMetadata,
  | 'id'
  | 'universalIdentifier'
  | 'applicationId'
  | 'workspaceId'
  | 'fieldIds'
  | 'nameSingular'
  | 'labelIdentifierFieldMetadataId'
  | 'imageIdentifierFieldMetadataId'
>;

type RelationsSelectFlatFieldMetadata = Pick<
  OrmFlatFieldMetadata,
  | 'id'
  | 'universalIdentifier'
  | 'applicationId'
  | 'workspaceId'
  | 'type'
  | 'name'
  | 'settings'
  | 'relationTargetObjectMetadataId'
>;

type RelationsSelectObjectsPermissions = Record<
  string,
  Pick<ObjectPermissions, 'canReadObjectRecords' | 'restrictedFields'>
>;

export const getRelationsSelectFields = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatObjectMetadata,
  objectsPermissions,
  depth,
  onlyUseLabelIdentifierFieldsInRelations = false,
  currentDepthLevelIsAJunctionTable = false,
  recurseIntoJunctionTableRelations = false,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<RelationsSelectFlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<RelationsSelectFlatFieldMetadata>;
  flatObjectMetadata: RelationsSelectFlatObjectMetadata;
  objectsPermissions: RelationsSelectObjectsPermissions;
  depth: Depth | undefined;
  onlyUseLabelIdentifierFieldsInRelations?: boolean;
  currentDepthLevelIsAJunctionTable?: boolean;
  recurseIntoJunctionTableRelations?: boolean;
}): CommonSelectedFields => {
  if (!isDefined(depth) || depth === 0) return {};

  const relationsSelectFields: CommonSelectedFields = {};

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const flatField = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldId,
    });

    if (
      !isFlatFieldMetadataOfType(flatField, FieldMetadataType.RELATION) &&
      !isFlatFieldMetadataOfType(flatField, FieldMetadataType.MORPH_RELATION)
    ) {
      continue;
    }

    if (
      objectsPermissions[flatObjectMetadata.id]?.restrictedFields[flatField.id]
        ?.canRead === false
    ) {
      continue;
    }

    if (currentDepthLevelIsAJunctionTable) {
      const fieldIsJunctionRelation = getIsFlatFieldAJunctionRelationField({
        flatField,
      });

      if (!fieldIsJunctionRelation) {
        continue;
      }
    }

    const relationTargetObjectMetadata =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatField.relationTargetObjectMetadataId,
      });

    if (
      !objectsPermissions[relationTargetObjectMetadata.id]?.canReadObjectRecords
    ) {
      continue;
    }

    // Timeline history grows with every update, so expanding it per record turns one page into thousands of rows
    if (
      relationTargetObjectMetadata.universalIdentifier ===
      STANDARD_OBJECTS.timelineActivity.universalIdentifier
    ) {
      continue;
    }

    const relationFieldSelectFields = getAllSelectableFields({
      restrictedFields:
        objectsPermissions[relationTargetObjectMetadata.id].restrictedFields,
      flatObjectMetadata: relationTargetObjectMetadata,
      flatFieldMetadataMaps,
      onlyUseLabelIdentifierFieldsInRelations,
    });

    if (Object.keys(relationFieldSelectFields).length === 0) continue;

    const flatFieldIsJoinColumn = getIsFlatFieldAJoinColumn({ flatField });

    const isFirstDepthLevel =
      depth === MAX_DEPTH &&
      isDefined(flatField.relationTargetObjectMetadataId);

    const shouldRecurseIntoRelation =
      isFirstDepthLevel ||
      (flatFieldIsJoinColumn && recurseIntoJunctionTableRelations);

    const nextLevelIsAJunctionTable = flatFieldIsJoinColumn;

    if (shouldRecurseIntoRelation) {
      const nestedRelationFieldSelectFields = getRelationsSelectFields({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: relationTargetObjectMetadata,
        objectsPermissions,
        depth: 1,
        onlyUseLabelIdentifierFieldsInRelations,
        currentDepthLevelIsAJunctionTable: nextLevelIsAJunctionTable,
        recurseIntoJunctionTableRelations,
      });

      relationsSelectFields[flatField.name] = {
        ...relationFieldSelectFields,
        ...nestedRelationFieldSelectFields,
      };
    } else {
      relationsSelectFields[flatField.name] = relationFieldSelectFields;
    }
  }

  return relationsSelectFields;
};
