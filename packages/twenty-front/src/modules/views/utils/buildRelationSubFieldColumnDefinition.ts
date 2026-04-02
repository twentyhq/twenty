// OMNIA-CUSTOM: Builds a ColumnDefinition for a relation sub-field
// (e.g., "Lead / Date of Birth" on the Policy table).

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

/**
 * Given a relation field's column definition and a sub-field name,
 * build a new ColumnDefinition that represents the sub-field as a
 * read-only column in the table.
 */
export const buildRelationSubFieldColumnDefinition = ({
  relationColumnDefinition,
  subFieldName,
  objectMetadataItems,
}: {
  relationColumnDefinition: ColumnDefinition<FieldMetadata>;
  subFieldName: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): ColumnDefinition<FieldMetadata> | null => {
  const relationMetadata = relationColumnDefinition.metadata as Record<
    string,
    unknown
  >;

  const targetObjectNameSingular =
    relationMetadata.relationObjectMetadataNameSingular as string | undefined;

  if (!targetObjectNameSingular) return null;

  const targetObjectMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === targetObjectNameSingular,
  );

  if (!targetObjectMetadata) return null;

  const subFieldMetadata = targetObjectMetadata.fields.find(
    (field: FieldMetadataItem) =>
      field.name === subFieldName && field.isActive,
  );

  if (!subFieldMetadata) return null;

  const relationFieldName = relationMetadata.fieldName as string;
  const objectMetadataNameSingular =
    relationMetadata.objectMetadataNameSingular as string;

  return {
    fieldMetadataId: `${relationColumnDefinition.fieldMetadataId}.${subFieldName}`,
    label: `${relationColumnDefinition.label} / ${subFieldMetadata.label}`,
    iconName: subFieldMetadata.icon ?? relationColumnDefinition.iconName,
    type: subFieldMetadata.type as FieldMetadataType,
    metadata: {
      fieldName: relationFieldName,
      objectMetadataNameSingular,
      isUIReadOnly: true,
      subFieldName,
    } as FieldMetadata,
    position: 0,
    size: 150,
    isLabelIdentifier: false,
    isVisible: true,
    isUIReadOnly: true,
    isFilterable: false,
    isSortable: false,
    defaultValue: subFieldMetadata.defaultValue,
  };
};
