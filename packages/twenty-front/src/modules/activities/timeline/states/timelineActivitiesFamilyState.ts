import { Activity } from '@/activities/types/Activity';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const timelineActivitiesFammilyState = createFamilyState<
  Activity | null,
  string
>({
  key: 'timelineActivitiesFammilyState',
  defaultValue: null,
});
