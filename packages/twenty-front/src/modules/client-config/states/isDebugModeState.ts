import { createState } from '@ui/utilities/state/utils/createState';

export const isDebugModeState = createState<boolean>({
  key: 'isDebugModeState',
  defaultValue: false,
});
