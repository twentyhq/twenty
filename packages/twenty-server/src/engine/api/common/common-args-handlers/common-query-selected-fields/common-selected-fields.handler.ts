import { Injectable } from '@nestjs/common';

import { FieldMetadataType, ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { getAllSelectableFields } from 'src/engine/api/rest/core/rest-to-common-args-handlers/utils/get-all-selectable-fields.util';
import { MAX_DEPTH } from 'src/engine/api/rest/input-request-parsers/constants/max-depth.constant';
import { Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class CommonSelectedFieldsHandler {
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
  }): CommonSelectedFieldsResult => {
    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id].restrictedFields;

    const { relations, relationsSelectFields } =
      this.getRelationsAndRelationsSelectFields({
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
      select: {
        ...selectableFields,
        ...relationsSelectFields,
      },
      relations,
      aggregate: {},
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

    for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
      const field = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldId,
      });

      if (!isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION))
        continue;

      if (!field.relationTargetObjectMetadataId) continue;

      const relationTargetObjectMetadata =
        flatObjectMetadataMaps.byId[field.relationTargetObjectMetadataId];

      if (!isDefined(relationTargetObjectMetadata)) {
        throw new CommonQueryRunnerException(
          `Object metadata relation target not found for relation creation payload`,
          CommonQueryRunnerExceptionCode.BAD_REQUEST,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }
      const relationFieldSelectFields = getAllSelectableFields({
        restrictedFields:
          objectsPermissions[relationTargetObjectMetadata.id].restrictedFields,
        flatObjectMetadata: relationTargetObjectMetadata,
        flatFieldMetadataMaps,
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
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatObjectMetadata: relationTargetObjectMetadata,
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
