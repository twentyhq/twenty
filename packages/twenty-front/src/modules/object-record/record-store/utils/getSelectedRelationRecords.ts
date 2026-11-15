import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type RecordGqlFields } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

// One level only: the related records keep their own relations nested
export const getSelectedRelationRecords = ({
  record,
  recordGqlFields,
  objectMetadataItems,
}: {
  record: ObjectRecord;
  recordGqlFields?: RecordGqlFields;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'fields'
  >[];
}): ObjectRecord[] => {
  const objectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => capitalize(nameSingular) === record.__typename,
  );

  return (objectMetadataItem?.fields ?? []).flatMap((field) => {
    if (
      !isManyToOneRelationField(field) ||
      (isDefined(recordGqlFields) && !isDefined(recordGqlFields[field.name]))
    ) {
      return [];
    }

    const relatedRecord: ObjectRecord | null | undefined = record[field.name];

    return isDefined(relatedRecord?.id) ? [relatedRecord] : [];
  });
};
