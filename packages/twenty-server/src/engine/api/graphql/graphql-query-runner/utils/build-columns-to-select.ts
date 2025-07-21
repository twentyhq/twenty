import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

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

  for (const [relationFieldName, _] of Object.entries(relations)) {
    const fieldMetadataId = objectMetadataItem.fieldIdByName[relationFieldName];

    if (!fieldMetadataId) {
      throw new InternalServerError(
        `Field metadata not found for relation field name: ${relationFieldName}`,
      );
    }

    const fieldMetadata = objectMetadataItem.fieldsById[fieldMetadataId];

    if (!fieldMetadata) {
      throw new InternalServerError(
        `Field metadata not found for relation field name: ${relationFieldName}`,
      );
    }

    if (
      !isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION)
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
