import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { isFieldMetadataTypeMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-morph-relation.util';
import { isFieldMetadataTypeRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-relation.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const buildColumnsToSelect = ({
  select,
  relations,
  objectMetadataItemWithFieldMaps,
}: {
  select: Record<string, unknown>;
  relations: Record<string, unknown>;
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
}) => {
  const requiredRelationColumns = getRequiredRelationColumns(
    relations,
    objectMetadataItemWithFieldMaps,
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
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
): string[] => {
  const requiredColumns: string[] = [];

  const fieldMetadataIds: string[] = [];

  for (const relationFieldName of Object.keys(relations)) {
    const relationFieldMetadataId =
      objectMetadataItem.fieldIdByName[relationFieldName];

    if (relationFieldMetadataId) {
      fieldMetadataIds.push(relationFieldMetadataId);
      continue;
    }

    const morphJoinColumnName = `${relationFieldName}Id`;
    const morphRelationFieldMetadataId =
      objectMetadataItem.fieldIdByJoinColumnName[morphJoinColumnName];

    if (morphRelationFieldMetadataId) {
      fieldMetadataIds.push(morphRelationFieldMetadataId);
      continue;
    }

    throw new InternalServerError(
      `Field metadata not found for relation field name: ${relationFieldName}`,
    );
  }

  for (const fieldMetadataId of fieldMetadataIds) {
    const fieldMetadata = objectMetadataItem.fieldsById[fieldMetadataId];

    if (
      !isFieldMetadataTypeRelation(fieldMetadata) &&
      !isFieldMetadataTypeMorphRelation(fieldMetadata)
    ) {
      continue;
    }

    if (
      fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE &&
      fieldMetadata.settings?.joinColumnName
    ) {
      requiredColumns.push(fieldMetadata.settings.joinColumnName);
    }
  }

  return requiredColumns;
};
