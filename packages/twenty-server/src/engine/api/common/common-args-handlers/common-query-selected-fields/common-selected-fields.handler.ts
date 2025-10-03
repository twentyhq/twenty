import { BadRequestException, Injectable } from '@nestjs/common';

import { FieldMetadataType, ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import {
  Depth,
  MAX_DEPTH,
} from 'src/engine/api/rest/input-factories/depth-input.factory';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Injectable()
export class CommonSelectedFieldsHandler {
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
  }): CommonSelectedFieldsResult => {
    const restrictedFields =
      objectsPermissions[objectMetadataMapItem.id].restrictedFields;

    const { relations, relationsSelectFields } =
      this.getRelationsAndRelationsSelectFields({
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
      select: {
        ...selectableFields,
        ...relationsSelectFields,
      },
      relations,
      aggregate: {},
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
    if (!isDefined(depth) || depth === 0) {
      return {
        relations: {},
        relationsSelectFields: {},
      };
    }

    let relations: { [key: string]: boolean | { [key: string]: boolean } } = {};

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
        const {
          relations: depth2Relations,
          relationsSelectFields: depth2RelationsSelectFields,
        } = this.getRelationsAndRelationsSelectFields({
          objectMetadataMaps,
          objectMetadataMapItem: relationTargetObjectMetadata,
          objectsPermissions,
          depth: 1,
        }) as {
          relations: { [key: string]: boolean };
          relationsSelectFields: {
            [key: string]: boolean;
          };
        };

        relations[field.name] = depth2Relations as {
          [key: string]: boolean;
        };

        relationsSelectFields[field.name] = {
          ...relationFieldSelectFields,
          ...depth2RelationsSelectFields,
        };
      } else {
        relations[field.name] = true;
        relationsSelectFields[field.name] = relationFieldSelectFields;
      }
    }

    return { relations, relationsSelectFields };
  }
}
