import { createState } from '@ui/utilities/state/utils/createState';

export const isSSOEnabledState = createState<boolean>({
  key: 'isSSOEnabledState',
  defaultValue: false,
});
