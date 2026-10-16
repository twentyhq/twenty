import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type SetOptional } from 'type-fest';

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
  recordFilter: SetOptional<PersistedRecordFilter, 'id'>;
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
    value: recordFilter.value,
  };

  if (isNonEmptyString(recordFilter.subFieldName)) {
    urlFilter.subField = recordFilter.subFieldName;
  }

  return urlFilter;
};
