import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { computeMorphRelationFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-relation-field-name.util';
import { isFieldMetadataTypeMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-morph-relation.util';
import { isFieldMetadataTypeRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-relation.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

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

      const morphRelationFieldName = computeMorphRelationFieldName({
        fieldName: fieldMetadata.name,
        relationDirection: fieldMetadata.settings.relationType,
        targetObjectMetadata,
      });

      const relationValue = relations[morphRelationFieldName];

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
