import { createState } from '@ui/utilities/state/utils/createState';

export const recordIndexIsCompactModeActiveState = createState<boolean>({
  key: 'recordIndexIsCompactModeActiveState',
  defaultValue: false,
});
