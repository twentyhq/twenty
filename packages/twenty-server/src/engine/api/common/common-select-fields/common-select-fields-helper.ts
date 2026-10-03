import { Injectable } from '@nestjs/common';

import { ObjectsPermissions } from 'twenty-shared/types';

import { getAllSelectableFields } from 'src/engine/api/common/common-select-fields/utils/get-all-selectable-fields.util';
import { getRelationsSelectFields } from 'src/engine/api/common/common-select-fields/utils/get-relations-select-fields.util';
import { CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
    fieldIdsToSelect,
  }: {
    objectsPermissions: ObjectsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    flatObjectMetadata: FlatObjectMetadata;
    depth: Depth | undefined;
    onlyUseLabelIdentifierFieldsInRelations?: boolean;
    recurseIntoJunctionTableRelations?: boolean;
    fieldIdsToSelect?: ReadonlySet<string>;
  }): CommonSelectedFields => {
    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id].restrictedFields;

    const relationsSelectFields = getRelationsSelectFields({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      objectsPermissions,
      depth,
      onlyUseLabelIdentifierFieldsInRelations,
      recurseIntoJunctionTableRelations,
      fieldIdsToSelect,
    });

    const selectableFields = getAllSelectableFields({
      restrictedFields,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      fieldIdsToSelect,
    });

    return {
      ...selectableFields,
      ...relationsSelectFields,
    };
  };
}
