import { Injectable } from '@nestjs/common';

import { FieldMetadataType, ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAllSelectableFields } from 'src/engine/api/common/common-select-fields/utils/get-all-selectable-fields.util';
import { getIsFlatFieldAJoinColumn } from 'src/engine/api/common/common-select-fields/utils/get-is-flat-field-a-join-column.util';
import { getIsFlatFieldAJunctionRelationField } from 'src/engine/api/common/common-select-fields/utils/get-is-flat-field-a-junction-relation-field';
import { CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { MAX_DEPTH } from 'src/engine/api/rest/input-request-parsers/constants/max-depth.constant';
import { Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type SelectFields = {
  [key: string]: boolean | SelectFields;
};

@Injectable()
export class CommonSelectFieldsHelper {
  computeFromDepth = ({
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatObjectMetadata,
    depth,
    onlyUseLabelIdentifierFieldsInRelations = false,
    recurseIntoJunctionTableRelations = false,
  }: {
    objectsPermissions: ObjectsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadata: FlatObjectMetadata;
    depth: Depth | undefined;
    onlyUseLabelIdentifierFieldsInRelations?: boolean;
    recurseIntoJunctionTableRelations?: boolean;
  }): CommonSelectedFields => {
    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id].restrictedFields;

    const relationsSelectFields = this.getRelationsAndRelationsSelectFields({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      objectsPermissions,
      depth,
      onlyUseLabelIdentifierFieldsInRelations,
      recurseIntoJunctionTableRelations,
    });

    const selectableFields = getAllSelectableFields({
      restrictedFields,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    return {
      ...selectableFields,
      ...relationsSelectFields,
    };
  };

  private getRelationsAndRelationsSelectFields({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatObjectMetadata,
    objectsPermissions,
    depth,
    onlyUseLabelIdentifierFieldsInRelations = false,
    currentDepthLevelIsAJunctionTable = false,
    recurseIntoJunctionTableRelations = false,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadata: FlatObjectMetadata;
    objectsPermissions: ObjectsPermissions;
    depth: Depth | undefined;
    onlyUseLabelIdentifierFieldsInRelations?: boolean;
    currentDepthLevelIsAJunctionTable?: boolean;
    recurseIntoJunctionTableRelations?: boolean;
  }) {
    if (!isDefined(depth) || depth === 0) return {};

    let relationsSelectFields: SelectFields = {};

    for (const fieldId of flatObjectMetadata.fieldIds) {
      const flatField = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldId,
      });

      if (!isFlatFieldMetadataOfType(flatField, FieldMetadataType.RELATION)) {
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
        const nestedRelationFieldSelectFields =
          this.getRelationsAndRelationsSelectFields({
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
  }
}
