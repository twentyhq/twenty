import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getAliasedRelationRecordKeys } from 'src/engine/api/common/utils/get-aliased-relation-record-keys.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
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
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
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

  const result = { ...fieldsToSelect, id: true };

  return result;
};

const isRelationSelected = (
  relations: Record<string, unknown>,
  fieldName: string,
) =>
  isDefined(relations[fieldName]) ||
  getAliasedRelationRecordKeys({ record: relations, fieldName }).length > 0;

const getRequiredRelationColumns = (
  relations: Record<string, unknown>,
  flatObjectMetadata: FlatObjectMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): string[] => {
  const requiredColumns: string[] = [];

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION)) {
      if (
        !isRelationSelected(relations, fieldMetadata.name) ||
        fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
      ) {
        continue;
      }

      requiredColumns.push(
        computeMorphOrRelationFieldJoinColumnName({ name: fieldMetadata.name }),
      );
    }

    if (
      isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.MORPH_RELATION)
    ) {
      const targetObjectMetadata = fieldMetadata.relationTargetObjectMetadataId
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

      if (
        fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE ||
        !isDefined(targetObjectMetadata)
      ) {
        continue;
      }

      if (!isRelationSelected(relations, fieldMetadata.name)) {
        continue;
      }

      requiredColumns.push(
        computeMorphOrRelationFieldJoinColumnName({ name: fieldMetadata.name }),
      );
    }
  }

  return requiredColumns;
};
