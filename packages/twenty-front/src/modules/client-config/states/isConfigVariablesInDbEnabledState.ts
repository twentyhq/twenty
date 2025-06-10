import { createState } from 'twenty-ui/utilities';
export const isConfigVariablesInDbEnabledState = createState<boolean>({
  key: 'isConfigVariablesInDbEnabled',
  defaultValue: false,
});
