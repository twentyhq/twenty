import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const mergeOneToManyRelationships = (
  records: ObjectRecord[],
  fieldName: string,
): ObjectRecord[] => {
  const allRelatedRecords: ObjectRecord[] = [];

  records.forEach((record) => {
    const relationValue = record[fieldName];
    if (Array.isArray(relationValue)) {
      allRelatedRecords.push(...relationValue);
    }
  });

  return allRelatedRecords.filter(
    (record, index, array) =>
      array.findIndex((r) => r.id === record.id) === index,
  );
};

export const mergeManyToOneRelationship = (
  records: ObjectRecord[],
  fieldName: string,
): ObjectRecord | null => {
  const firstNonNullValue = records
    .map((record) => record[fieldName])
    .find((value) => isDefined(value) && value !== null);

  return firstNonNullValue || null;
};

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
