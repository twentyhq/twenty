import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ActivityTargetWithTargetRecord = {
  targetObjectMetadataItem: ObjectMetadataItem;
  activityTarget: NoteTarget | TaskTarget;
  targetObject: ObjectRecord;
};
