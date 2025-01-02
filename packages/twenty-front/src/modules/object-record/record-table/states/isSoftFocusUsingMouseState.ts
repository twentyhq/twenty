import { createState } from '@ui/utilities/state/utils/createState';

export const isSoftFocusUsingMouseState = createState<boolean>({
  key: 'isSoftFocusUsingMouseState',
  defaultValue: false,
});
