import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';

export type ObjectRecordOperationBrowserEventDetail = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  operation: ObjectRecordOperation;
};
