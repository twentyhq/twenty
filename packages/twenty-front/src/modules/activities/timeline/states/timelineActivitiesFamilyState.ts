import { Activity } from '@/activities/types/Activity';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const timelineActivitiesFamilyState = createFamilyState<
  Activity | null,
  string
>({
  key: 'timelineActivitiesFamilyState',
  defaultValue: null,
});
