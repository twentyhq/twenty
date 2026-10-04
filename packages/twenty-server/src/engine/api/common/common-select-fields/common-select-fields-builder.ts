import { Injectable } from '@nestjs/common';

import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonSelectFieldsException } from 'src/engine/api/common/common-select-fields/common-select-fields.exception';
import { type SelectionDepth } from 'src/engine/api/common/common-select-fields/types/selection-depth.type';
import { computeDefaultFieldNamesToSelect } from 'src/engine/api/common/common-select-fields/utils/compute-default-field-names-to-select.util';
import { getAllSelectableFields } from 'src/engine/api/common/common-select-fields/utils/get-all-selectable-fields.util';
import { getRelationsSelectFields } from 'src/engine/api/common/common-select-fields/utils/get-relations-select-fields.util';
import { isOneToManyRelationFlatField } from 'src/engine/api/common/common-select-fields/utils/is-one-to-many-relation-flat-field.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class CommonSelectFieldsBuilder {
  buildFromDepth = ({
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatObjectMetadata,
    depth,
    onlyUseLabelIdentifierFieldsInRelations = false,
    recurseIntoJunctionTableRelations = false,
    requestedFields,
    maximumDefaultFieldCount,
  }: {
    objectsPermissions: ObjectsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    flatObjectMetadata: FlatObjectMetadata;
    depth: SelectionDepth | undefined;
    onlyUseLabelIdentifierFieldsInRelations?: boolean;
    recurseIntoJunctionTableRelations?: boolean;
    requestedFields?: ReadonlySet<string>;
    maximumDefaultFieldCount?: number;
  }): {
    selectedFields: CommonSelectedFields;
    isFieldSetRestricted: boolean;
  } => {
    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id].restrictedFields;

    const readableFlatFields = flatObjectMetadata.fieldIds
      .map((fieldId) =>
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          flatEntityId: fieldId,
        }),
      )
      .filter((flatField) => restrictedFields[flatField.id]?.canRead !== false);

    let fieldNamesToSelect: ReadonlySet<string> | undefined;

    if (isDefined(requestedFields)) {
      if (requestedFields.size === 0) {
        throw new CommonSelectFieldsException(
          'Requested fields cannot be empty.',
        );
      }

      const readableFlatFieldByName = new Map(
        readableFlatFields.map((flatField) => [flatField.name, flatField]),
      );
      const invalidFieldNames = [...requestedFields].filter(
        (fieldName) => !readableFlatFieldByName.has(fieldName),
      );

      if (invalidFieldNames.length > 0) {
        throw new CommonSelectFieldsException(
          `Unknown or unreadable fields on '${flatObjectMetadata.nameSingular}': ${invalidFieldNames.join(', ')}`,
        );
      }

      if (!isDefined(depth) || depth === 0) {
        const oneToManyRelationFieldNames = readableFlatFields
          .filter(
            (flatField) =>
              requestedFields.has(flatField.name) &&
              isOneToManyRelationFlatField(flatField),
          )
          .map((flatField) => flatField.name);

        if (oneToManyRelationFieldNames.length > 0) {
          throw new CommonSelectFieldsException(
            `One-to-many relation fields on '${flatObjectMetadata.nameSingular}' require a positive depth: ${oneToManyRelationFieldNames.join(', ')}`,
          );
        }
      }

      fieldNamesToSelect = new Set(['id', ...requestedFields]);
    } else if (isDefined(maximumDefaultFieldCount)) {
      fieldNamesToSelect = computeDefaultFieldNamesToSelect({
        flatObjectMetadata,
        readableFlatFields,
        depth,
        maximumDefaultFieldCount,
      });
    }

    const relationsSelectFields = getRelationsSelectFields({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      objectsPermissions,
      depth,
      onlyUseLabelIdentifierFieldsInRelations,
      recurseIntoJunctionTableRelations,
      fieldNamesToSelect,
    });

    const selectableFields = getAllSelectableFields({
      restrictedFields,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      fieldNamesToSelect,
    });

    return {
      selectedFields: {
        ...selectableFields,
        ...relationsSelectFields,
      },
      isFieldSetRestricted: isDefined(fieldNamesToSelect),
    };
  };
}
