import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ActivityTargetWithTargetRecord = {
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  activityTarget: NoteTarget | TaskTarget;
  targetObject: ObjectRecord;
};
