import { createState } from '@/ui/utilities/state/utils/createState';

export const viewableActivityIdState = createState<string | null>({
  key: 'activities/viewable-activity-id',
  defaultValue: null,
});
