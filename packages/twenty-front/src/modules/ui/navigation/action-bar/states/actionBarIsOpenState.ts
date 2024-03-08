import { createState } from '@/ui/utilities/state/utils/createState';

export const actionBarOpenState = createState<boolean>({
  key: 'actionBarOpenState',
  defaultValue: false,
});
