import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getSelectedRecordsContextText = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  records: ObjectRecord[],
  totalCount: number,
  allowRequestsToTwentyIcons: boolean,
) => {
  return totalCount === 1
    ? getObjectRecordIdentifier({
        objectMetadataItem,
        record: records[0],
        allowRequestsToTwentyIcons,
      }).name
    : `${totalCount} ${objectMetadataItem.labelPlural}`;
};
