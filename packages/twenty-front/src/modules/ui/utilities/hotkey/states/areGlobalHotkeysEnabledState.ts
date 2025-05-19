import { createState } from 'twenty-ui/utilities';

export const areGlobalHotkeysEnabledState = createState<boolean>({
  key: 'areGlobalHotkeysEnabledState',
  defaultValue: true,
});
