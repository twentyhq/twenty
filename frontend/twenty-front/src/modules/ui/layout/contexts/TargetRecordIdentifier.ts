import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export type TargetRecordIdentifier = Pick<
  ActivityTargetableObject,
  'id' | 'targetObjectNameSingular'
>;
