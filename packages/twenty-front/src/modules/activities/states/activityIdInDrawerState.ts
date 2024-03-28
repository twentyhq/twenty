import { createState } from '@/ui/utilities/state/utils/createState';

export const activityIdInDrawerState = createState<string | null>({
  key: 'activityIdInDrawerState',
  defaultValue: null,
});
