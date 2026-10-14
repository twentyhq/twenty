import { BadRequestException } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordExportTraversedField } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export type ResolvedTraversedRecordExportField = {
  relationField: FlatFieldMetadata<FieldMetadataType.RELATION>;
  targetField: FlatFieldMetadata;
};

const throwUnavailableField = (): never => {
  throw new BadRequestException(t`An export field is no longer available.`);
};

export const resolveTraversedRecordExportFields = ({
  traversedFields,
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  traversedFields: RecordExportTraversedField[];
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatFieldMetadataMaps;
}): ResolvedTraversedRecordExportField[] =>
  traversedFields.map(({ fieldMetadataId, relationTargetFieldMetadataId }) => {
    const relationField = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldMetadataId,
    });

    if (
      relationField.objectMetadataId !== objectMetadataId ||
      !relationField.isActive ||
      !isFlatFieldMetadataOfType(relationField, FieldMetadataType.RELATION) ||
      relationField.settings.relationType !== RelationType.MANY_TO_ONE ||
      isDefined(relationField.settings.junctionTargetFieldId)
    ) {
      return throwUnavailableField();
    }

    const targetField = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: relationTargetFieldMetadataId,
    });

    if (
      targetField.objectMetadataId !==
        relationField.relationTargetObjectMetadataId ||
      !targetField.isActive ||
      isFlatFieldMetadataOfType(targetField, FieldMetadataType.RELATION) ||
      isFlatFieldMetadataOfType(targetField, FieldMetadataType.MORPH_RELATION)
    ) {
      return throwUnavailableField();
    }

    return { relationField, targetField };
  });
