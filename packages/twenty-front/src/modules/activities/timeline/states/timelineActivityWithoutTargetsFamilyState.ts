import { Activity } from '@/activities/types/Activity';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const timelineActivityWithoutTargetsFamilyState = createFamilyState<
  Pick<Activity, 'id' | 'title' | 'createdAt' | 'author' | 'type'> | null,
  string
>({
  key: 'timelineActivityWithoutTargetsFamilyState',
  defaultValue: null,
});
