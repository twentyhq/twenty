import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
  objectMetadataItem: ObjectMetadataItem;
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
