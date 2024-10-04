import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ActivityTargetWithTargetRecord = {
  targetObjectMetadataItem: ObjectMetadataItem;
  activityTarget: NoteTarget | TaskTarget;
  targetObject: ObjectRecord;
};
