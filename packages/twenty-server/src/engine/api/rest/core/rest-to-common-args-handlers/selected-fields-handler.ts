import { BadRequestException, Injectable } from '@nestjs/common';

import { FieldMetadataType, ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { MAX_DEPTH } from 'src/engine/api/rest/input-request-parsers/constants/max-depth.constant';
import { Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Injectable()
export class RestToCommonSelectedFieldsHandler {
  computeFromDepth = ({
    objectsPermissions,
    objectMetadataMaps,
    objectMetadataMapItem,
    depth,
  }: {
    objectsPermissions: ObjectsPermissions;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    depth: Depth | undefined;
  }): CommonSelectedFields => {
    const restrictedFields =
      objectsPermissions[objectMetadataMapItem.id].restrictedFields;

    const relationsSelectFields = this.getRelationsAndRelationsSelectFields({
      objectMetadataMaps,
      objectMetadataMapItem,
      objectsPermissions,
      depth,
    });

    const selectableFields = getAllSelectableFields({
      restrictedFields,
      objectMetadata: {
        objectMetadataMapItem,
      },
    });

    return {
      ...selectableFields,
      ...relationsSelectFields,
    };
  };

  private getRelationsAndRelationsSelectFields({
    objectMetadataMaps,
    objectMetadataMapItem,
    objectsPermissions,
    depth,
  }: {
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    objectsPermissions: ObjectsPermissions;
    depth: Depth | undefined;
  }) {
    if (!isDefined(depth) || depth === 0) return {};

    let relationsSelectFields: {
      [key: string]:
        | boolean
        | { [key: string]: boolean | { [key: string]: boolean } };
    } = {};

    for (const field of Object.values(objectMetadataMapItem.fieldsById)) {
      if (!isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION))
        continue;

      const relationTargetObjectMetadata =
        objectMetadataMaps.byId[field.relationTargetObjectMetadataId];

      if (!isDefined(relationTargetObjectMetadata)) {
        throw new BadRequestException(
          `Object metadata relation target not found for relation creation payload`,
        );
      }
      const relationFieldSelectFields = getAllSelectableFields({
        restrictedFields:
          objectsPermissions[relationTargetObjectMetadata.id].restrictedFields,
        objectMetadata: {
          objectMetadataMapItem: relationTargetObjectMetadata,
        },
      });

      if (Object.keys(relationFieldSelectFields).length === 0) continue;

      if (
        depth === MAX_DEPTH &&
        isDefined(field.relationTargetObjectMetadataId)
      ) {
        const depth2RelationsSelectFields =
          this.getRelationsAndRelationsSelectFields({
            objectMetadataMaps,
            objectMetadataMapItem: relationTargetObjectMetadata,
            objectsPermissions,
            depth: 1,
          }) as {
            relationsSelectFields: {
              [key: string]: boolean;
            };
          };

        relationsSelectFields[field.name] = {
          ...relationFieldSelectFields,
          ...depth2RelationsSelectFields,
        };
      } else {
        relationsSelectFields[field.name] = relationFieldSelectFields;
      }
    }

    return relationsSelectFields;
  }
}
