import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { buildFieldSelection } from 'src/engine/api/common/common-select-fields/utils/build-field-selection.util';
import { getIsFlatFieldAJoinColumn } from 'src/engine/api/common/common-select-fields/utils/get-is-flat-field-a-join-column.util';
import { getIsFlatFieldAJunctionRelationField } from 'src/engine/api/common/common-select-fields/utils/get-is-flat-field-a-junction-relation-field';
import { isRelationTargetExcludedFromSelection } from 'src/engine/api/common/common-select-fields/utils/is-relation-target-excluded-from-selection.util';
import { CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { MAX_SELECTION_DEPTH } from 'src/engine/api/common/common-select-fields/constants/max-selection-depth.constant';
import { SelectionDepth } from 'src/engine/api/common/common-select-fields/types/selection-depth.type';
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
  | 'morphId'
  | 'name'
  | 'settings'
  | 'relationTargetObjectMetadataId'
>;

type RelationsSelectObjectsPermissions = Record<
  string,
  Pick<ObjectPermissions, 'canReadObjectRecords' | 'restrictedFields'>
>;

export const buildRelationSelectionFromDepth = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatObjectMetadata,
  flatFields,
  objectsPermissions,
  depth,
  onlyUseLabelIdentifierFieldsInRelations = false,
  currentDepthLevelIsAJunctionTable = false,
  recurseIntoJunctionTableRelations = false,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<RelationsSelectFlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<RelationsSelectFlatFieldMetadata>;
  flatObjectMetadata: RelationsSelectFlatObjectMetadata;
  flatFields: readonly RelationsSelectFlatFieldMetadata[];
  objectsPermissions: RelationsSelectObjectsPermissions;
  depth: SelectionDepth | undefined;
  onlyUseLabelIdentifierFieldsInRelations?: boolean;
  currentDepthLevelIsAJunctionTable?: boolean;
  recurseIntoJunctionTableRelations?: boolean;
}): CommonSelectedFields => {
  if (!isDefined(depth) || depth === 0) return {};

  const relationsSelectFields: CommonSelectedFields = {};

  for (const flatField of flatFields) {
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

    if (!isDefined(flatField.relationTargetObjectMetadataId)) continue;

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

    if (isRelationTargetExcludedFromSelection(relationTargetObjectMetadata)) {
      continue;
    }

    const relationFlatFields = getFlatFieldsFromFlatObjectMetadata(
      relationTargetObjectMetadata,
      flatFieldMetadataMaps,
    );

    const relationFieldSelectFields = buildFieldSelection({
      restrictedFields:
        objectsPermissions[relationTargetObjectMetadata.id].restrictedFields,
      flatObjectMetadata: relationTargetObjectMetadata,
      flatFields: relationFlatFields,
      onlyUseLabelIdentifierFieldsInRelations,
    });

    if (Object.keys(relationFieldSelectFields).length === 0) continue;

    const flatFieldIsJoinColumn = getIsFlatFieldAJoinColumn({ flatField });

    const isFirstDepthLevel =
      depth === MAX_SELECTION_DEPTH &&
      isDefined(flatField.relationTargetObjectMetadataId);

    const shouldRecurseIntoRelation =
      isFirstDepthLevel ||
      (flatFieldIsJoinColumn && recurseIntoJunctionTableRelations);

    const nextLevelIsAJunctionTable = flatFieldIsJoinColumn;

    if (shouldRecurseIntoRelation) {
      const nestedRelationFieldSelectFields = buildRelationSelectionFromDepth({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: relationTargetObjectMetadata,
        flatFields: relationFlatFields,
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
