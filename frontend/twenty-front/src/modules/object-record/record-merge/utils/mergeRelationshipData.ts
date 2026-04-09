import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { mergeManyToOneRelationship } from '@/object-record/record-merge/utils/mergeManyToOneRelationship';
import { mergeOneToManyRelationships } from '@/object-record/record-merge/utils/mergeOneToManyRelationships';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const mergeRecordRelationshipData = (
  records: ObjectRecord[],
  fieldMetadataItems: FieldMetadataItem[],
  isLoading: boolean,
): Record<string, ObjectRecord[] | ObjectRecord | null> => {
  if (isLoading || records.length === 0) {
    return {};
  }

  const mergedData: Record<string, ObjectRecord[] | ObjectRecord | null> = {};

  const relationFieldMetadataItems = fieldMetadataItems.filter(
    (field) => field.type === FieldMetadataType.RELATION,
  );

  relationFieldMetadataItems.forEach((fieldMetadataItem) => {
    const fieldName = fieldMetadataItem.name;
    const relationType = fieldMetadataItem.relation?.type;

    if (relationType === RelationType.ONE_TO_MANY) {
      mergedData[fieldName] = mergeOneToManyRelationships(records, fieldName);
    } else if (relationType === RelationType.MANY_TO_ONE) {
      mergedData[fieldName] = mergeManyToOneRelationship(records, fieldName);
    }
  });

  return mergedData;
};
