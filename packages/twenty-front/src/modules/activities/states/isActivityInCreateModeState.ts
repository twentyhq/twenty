import { createState } from '@ui/utilities/state/utils/createState';

export const isActivityInCreateModeState = createState<boolean>({
  key: 'isActivityInCreateModeState',
  defaultValue: false,
});
