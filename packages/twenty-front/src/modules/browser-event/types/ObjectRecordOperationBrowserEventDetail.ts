import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';

export type ObjectRecordOperationBrowserEventDetail = {
  objectMetadataItem: ObjectMetadataItem;
  operation: ObjectRecordOperation;
};
