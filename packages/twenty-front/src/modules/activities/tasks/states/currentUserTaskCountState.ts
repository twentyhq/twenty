import { createState } from '@/ui/utilities/state/utils/createState';

export const currentUserDueTaskCountState = createState<number>({
  defaultValue: 0,
  key: 'currentUserDueTaskCountState',
});
