import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ActivityTargetableObject = {
  id: string;
  targetObjectNameSingular: string;
  targetObjectRecord: ObjectRecord;
  relatedTargetableObjects?: ActivityTargetableObject[];
};
