import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ActivityTargetWithTargetRecord = {
  targetObjectMetadataItem: ObjectMetadataItem;
  activityTarget: ActivityTarget;
  targetObject: ObjectRecord;
};
