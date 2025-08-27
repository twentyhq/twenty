import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getSelectedRecordsContextText = (
  objectMetadataItem: ObjectMetadataItem,
  records: ObjectRecord[],
  totalCount: number,
) => {
  return totalCount === 1
    ? getObjectRecordIdentifier({ objectMetadataItem, record: records[0] }).name
    : `${totalCount} ${objectMetadataItem.labelPlural}`;
};
