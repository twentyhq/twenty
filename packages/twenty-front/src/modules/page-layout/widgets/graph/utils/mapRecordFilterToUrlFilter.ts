import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export type UrlFilter = {
  field: string;
  op: string;
  value: string;
  subField?: string;
};

export const mapRecordFilterToUrlFilter = ({
  recordFilter,
  objectMetadataItem,
}: {
  recordFilter: RecordFilter;
  objectMetadataItem: EnrichedObjectMetadataItem;
}): UrlFilter | null => {
  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordFilter.fieldMetadataId,
  );

  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  // The URL filter grammar cannot name a field of the related record; emitting the base field would make the record index show a chip it then ignores.
  if (isDefined(recordFilter.relationTargetFieldMetadataId)) {
    return null;
  }

  const urlFilter: UrlFilter = {
    field: fieldMetadataItem.name,
    op: recordFilter.operand,
    value: recordFilter.value,
  };

  if (isNonEmptyString(recordFilter.subFieldName)) {
    urlFilter.subField = recordFilter.subFieldName;
  }

  return urlFilter;
};
