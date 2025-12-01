import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildColumnsToSelect = ({
  select,
  relations,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  select: Record<string, unknown>;
  relations: Record<string, unknown>;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  const requiredRelationColumns = getRequiredRelationColumns(
    relations,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  );

  const fieldsToSelect: Record<string, boolean> = Object.entries(select)
    .filter(
      ([_columnName, value]) => value === true && typeof value !== 'object',
    )
    .reduce((acc, [columnName]) => ({ ...acc, [columnName]: true }), {});

  for (const columnName of requiredRelationColumns) {
    fieldsToSelect[columnName] = true;
  }

  return { ...fieldsToSelect, id: true };
};

const getRequiredRelationColumns = (
  relations: Record<string, unknown>,
  flatObjectMetadata: FlatObjectMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): string[] => {
  const requiredColumns: string[] = [];

  for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION)) {
      const relationValue = relations[fieldMetadata.name];

      if (
        !isDefined(relationValue) ||
        !isDefined(fieldMetadata?.settings?.joinColumnName) ||
        fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
      ) {
        continue;
      }

      requiredColumns.push(fieldMetadata.settings.joinColumnName);
    }

    if (
      isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.MORPH_RELATION)
    ) {
      const targetObjectMetadata = fieldMetadata.relationTargetObjectMetadataId
        ? flatObjectMetadataMaps.byId[
            fieldMetadata.relationTargetObjectMetadataId
          ]
        : undefined;

      if (
        !fieldMetadata.settings?.relationType ||
        !isDefined(targetObjectMetadata)
      ) {
        continue;
      }

      const relationValue = relations[fieldMetadata.name];

      if (
        !isDefined(relationValue) ||
        !isDefined(fieldMetadata?.settings?.joinColumnName)
      ) {
        continue;
      }

      requiredColumns.push(fieldMetadata.settings.joinColumnName);
    }
  }

  return requiredColumns;
};
