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
  const relationFields = objectMetadataItem.fields.filter(
    (field) => isFieldRelation(field) || isFieldMorphRelation(field),
  );

  const joinColumnNames = relationFields.map((field) =>
    computeRelationGqlFieldJoinColumnName({ name: field.name }),
  );

  const plainFieldNames = new Set(
    objectMetadataItem.fields
      .filter(
        (field) =>
          !relationFields.includes(field) &&
          !joinColumnNames.includes(field.name),
      )
      .map((field) => field.name),
  );

  return Object.fromEntries(
    Object.entries(record).filter(([fieldName]) =>
      plainFieldNames.has(fieldName),
    ),
  );
};
