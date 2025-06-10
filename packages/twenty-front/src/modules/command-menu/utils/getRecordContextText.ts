import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from 'twenty-shared/utils';

export const getSelectedRecordsContextText = (
  objectMetadataItem: ObjectMetadataItem,
  records: ObjectRecord[],
  totalCount: number,
) => {
  return totalCount === 1
    ? getObjectRecordIdentifier({ objectMetadataItem, record: records[0] }).name
    : `${totalCount} ${capitalize(objectMetadataItem.namePlural)}`;
};
