import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const pickPlainFieldsFromRecord = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  record: Record<string, unknown>;
}) => {
  const relationFieldNames = objectMetadataItem.fields
    .filter((field) => isFieldRelation(field) || isFieldMorphRelation(field))
    .map((field) => field.name);

  const relationAndJoinColumnNames = new Set([
    ...relationFieldNames,
    ...relationFieldNames.map((name) =>
      computeRelationGqlFieldJoinColumnName({ name }),
    ),
  ]);

  const plainFieldNames = new Set(
    objectMetadataItem.fields
      .map((field) => field.name)
      .filter((fieldName) => !relationAndJoinColumnNames.has(fieldName)),
  );

  return Object.fromEntries(
    Object.entries(record).filter(([fieldName]) =>
      plainFieldNames.has(fieldName),
    ),
  );
};
