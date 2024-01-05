import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ActivityTargetObjectRecord = {
  targetObjectMetadataItem: ObjectMetadataItem;
  activityTargetRecord: ObjectRecord;
  targetObjectRecord: ObjectRecord;
  targetObjectNameSingular: string;
};
