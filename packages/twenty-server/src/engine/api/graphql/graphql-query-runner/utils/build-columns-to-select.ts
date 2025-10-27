import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { isFieldMetadataTypeMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-morph-relation.util';
import { isFieldMetadataTypeRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-relation.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

export const buildColumnsToSelect = ({
  select,
  relations,
  objectMetadataItemWithFieldMaps,
  objectMetadataMaps,
}: {
  select: Record<string, unknown>;
  relations: Record<string, unknown>;
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  objectMetadataMaps: {
    byId: Partial<
      Record<
        string,
        Pick<ObjectMetadataItemWithFieldMaps, 'nameSingular' | 'namePlural'>
      >
    >;
  };
}) => {
  const requiredRelationColumns = getRequiredRelationColumns(
    relations,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
  );

  // Map selected field names to fieldMetadataIds to inspect storage types
  const columnNameToFieldId = getColumnNameToFieldMetadataIdMap(
    objectMetadataItemWithFieldMaps,
  );

  const fieldsToSelect: Record<string, boolean> = Object.entries(select)
    .filter(
      ([_columnName, value]) => value === true && typeof value !== 'object',
    )
    .reduce(
      (acc, [columnName]) => {
        const fieldId = columnNameToFieldId[columnName];

        if (
          fieldId &&
          objectMetadataItemWithFieldMaps.fieldsById[fieldId]?.storage !==
            'postgres'
        ) {
          return acc;
        }

        return { ...acc, [columnName]: true };
      },
      {} as Record<string, boolean>,
    );

  for (const columnName of requiredRelationColumns) {
    fieldsToSelect[columnName] = true;
  }

  const { id: _, ...fieldsToSelectWithoutId } = fieldsToSelect;

  return fieldsToSelectWithoutId;
};

const getRequiredRelationColumns = (
  relations: Record<string, unknown>,
  objectMetadataItem: Pick<ObjectMetadataItemWithFieldMaps, 'fieldsById'>,
  objectMetadataMaps: {
    byId: Partial<
      Record<
        string,
        Pick<ObjectMetadataItemWithFieldMaps, 'nameSingular' | 'namePlural'>
      >
    >;
  },
): string[] => {
  const requiredColumns: string[] = [];

  for (const fieldMetadata of Object.values(objectMetadataItem.fieldsById)) {
    if (isFieldMetadataTypeRelation(fieldMetadata)) {
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

    if (isFieldMetadataTypeMorphRelation(fieldMetadata)) {
      const targetObjectMetadata =
        objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

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
