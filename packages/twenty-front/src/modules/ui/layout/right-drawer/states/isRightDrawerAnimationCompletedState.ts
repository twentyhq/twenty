import { createState } from '@ui/utilities/state/utils/createState';

export const isRightDrawerAnimationCompletedState = createState<boolean>({
  key: 'isRightDrawerAnimationCompletedState',
  defaultValue: false,
});
