import { createFamilyState } from 'twenty-ui';

import { Activity } from '@/activities/types/Activity';

export const timelineActivitiesFammilyState = createFamilyState<
  Activity | null,
  string
>({
  key: 'timelineActivitiesFammilyState',
  defaultValue: null,
});
