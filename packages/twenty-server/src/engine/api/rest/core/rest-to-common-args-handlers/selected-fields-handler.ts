import { Injectable } from '@nestjs/common';

import { FieldMetadataType, ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { getAllSelectableFields } from 'src/engine/api/rest/core/rest-to-common-args-handlers/utils/get-all-selectable-fields.util';
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
export class RestToCommonSelectedFieldsHandler {
  computeFromDepth = ({
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatObjectMetadata,
    depth,
  }: {
    objectsPermissions: ObjectsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadata: FlatObjectMetadata;
    depth: Depth | undefined;
  }): CommonSelectedFields => {
    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id].restrictedFields;

    const relationsSelectFields = this.getRelationsAndRelationsSelectFields({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      objectsPermissions,
      depth,
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
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadata: FlatObjectMetadata;
    objectsPermissions: ObjectsPermissions;
    depth: Depth | undefined;
  }) {
    if (!isDefined(depth) || depth === 0) return {};

    let relationsSelectFields: SelectFields = {};

    for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
      const flatField = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldId,
      });

      if (!isFlatFieldMetadataOfType(flatField, FieldMetadataType.RELATION))
        continue;

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
      });

      if (Object.keys(relationFieldSelectFields).length === 0) continue;

      if (
        depth === MAX_DEPTH &&
        isDefined(flatField.relationTargetObjectMetadataId)
      ) {
        const depth2RelationsSelectFields =
          this.getRelationsAndRelationsSelectFields({
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            flatObjectMetadata: relationTargetObjectMetadata,
            objectsPermissions,
            depth: 1,
          });

        relationsSelectFields[flatField.name] = {
          ...relationFieldSelectFields,
          ...depth2RelationsSelectFields,
        };
      } else {
        relationsSelectFields[flatField.name] = relationFieldSelectFields;
      }
    }

    return relationsSelectFields;
  }
}
