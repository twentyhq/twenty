import { createFamilyState } from 'twenty-ui';

import { Activity } from '@/activities/types/Activity';

export const timelineActivityWithoutTargetsFamilyState = createFamilyState<
  Pick<Activity, 'id' | 'title' | 'createdAt' | 'author' | 'type'> | null,
  string
>({
  key: 'timelineActivityWithoutTargetsFamilyState',
  defaultValue: null,
});
