import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
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
  recordFilter: PersistedRecordFilter;
  objectMetadataItem: EnrichedObjectMetadataItem;
}): UrlFilter | null => {
  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordFilter.fieldMetadataId,
  );

  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  const urlFilter: UrlFilter = {
    field: fieldMetadataItem.name,
    op: recordFilter.operand,
    value: recordFilter.value ?? '',
  };

  if (isNonEmptyString(recordFilter.subFieldName)) {
    urlFilter.subField = recordFilter.subFieldName;
  }

  return urlFilter;
};
