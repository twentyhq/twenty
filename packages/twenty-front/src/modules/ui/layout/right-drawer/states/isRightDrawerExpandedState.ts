import { createState } from '@/ui/utilities/state/utils/createState';

export const isRightDrawerExpandedState = createState<boolean>({
  key: 'isRightDrawerExpandedState',
  defaultValue: false,
});
