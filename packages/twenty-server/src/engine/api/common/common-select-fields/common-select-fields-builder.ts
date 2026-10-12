import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldMetadataType,
  RelationType,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { CommonSelectFieldsException } from 'src/engine/api/common/common-select-fields/common-select-fields.exception';
import { type SelectionDepth } from 'src/engine/api/common/common-select-fields/types/selection-depth.type';
import { computeDefaultFieldNamesToSelect } from 'src/engine/api/common/common-select-fields/utils/compute-default-field-names-to-select.util';
import { buildFieldSelection } from 'src/engine/api/common/common-select-fields/utils/build-field-selection.util';
import { buildRelationSelectionFromDepth } from 'src/engine/api/common/common-select-fields/utils/build-relation-selection-from-depth.util';
import { isFlatFieldMetadataOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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
  } => {
    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id].restrictedFields;

    const readableFlatFields = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatObjectMetadata.fieldIds,
      flatEntityMaps: flatFieldMetadataMaps,
    }).filter((flatField) => restrictedFields[flatField.id]?.canRead !== false);

    const fieldsFromDepth = readableFlatFields.filter(
      (field) =>
        depth ||
        !(
          isFlatFieldMetadataOfTypes(field, [
            FieldMetadataType.RELATION,
            FieldMetadataType.MORPH_RELATION,
          ]) && field.settings?.relationType === RelationType.ONE_TO_MANY
        ),
    );

    const fieldNamesToSelect =
      this.validateRequestedFields({
        requestedFields,
        readableFlatFields,
        objectNameSingular: flatObjectMetadata.nameSingular,
        fieldNamesFromDepth: new Set(
          fieldsFromDepth.map((field) => field.name),
        ),
      }) ??
      computeDefaultFieldNamesToSelect({
        flatObjectMetadata,
        readableFlatFields: fieldsFromDepth,
        maximumDefaultFieldCount,
      });

    const flatFields = readableFlatFields.filter((field) =>
      fieldNamesToSelect.has(field.name),
    );

    const relationsSelectFields = buildRelationSelectionFromDepth({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      objectsPermissions,
      depth,
      onlyUseLabelIdentifierFieldsInRelations,
      recurseIntoJunctionTableRelations,
      flatFields,
    });

    const selectableFields = buildFieldSelection({
      restrictedFields,
      flatObjectMetadata,
      flatFields,
    });

    return {
      selectedFields: {
        ...selectableFields,
        ...relationsSelectFields,
      },
    };
  };

  private validateRequestedFields({
    requestedFields,
    readableFlatFields,
    objectNameSingular,
    fieldNamesFromDepth,
  }: {
    requestedFields: ReadonlySet<string> | undefined;
    readableFlatFields: OrmFlatFieldMetadata[];
    objectNameSingular: string;
    fieldNamesFromDepth: ReadonlySet<string>;
  }): ReadonlySet<string> | undefined {
    if (!isDefined(requestedFields)) return undefined;

    if (requestedFields.size === 0) {
      throw new CommonSelectFieldsException(
        'Requested fields cannot be empty.',
      );
    }

    const readableFieldByName = new Map(
      readableFlatFields.map((field) => [field.name, field]),
    );
    const invalidFieldNames: string[] = [];
    const unexpandedRelationNames: string[] = [];

    for (const fieldName of requestedFields) {
      const field = readableFieldByName.get(fieldName);

      if (!isDefined(field)) {
        invalidFieldNames.push(fieldName);
      } else if (!fieldNamesFromDepth.has(fieldName)) {
        unexpandedRelationNames.push(fieldName);
      }
    }

    if (invalidFieldNames.length > 0) {
      throw new CommonSelectFieldsException(
        `Unknown or unreadable fields on '${objectNameSingular}': ${invalidFieldNames.join(', ')}`,
      );
    }

    if (unexpandedRelationNames.length > 0) {
      throw new CommonSelectFieldsException(
        `One-to-many relation fields on '${objectNameSingular}' require a positive depth: ${unexpandedRelationNames.join(', ')}`,
      );
    }

    return new Set(['id', ...requestedFields]);
  }
}
