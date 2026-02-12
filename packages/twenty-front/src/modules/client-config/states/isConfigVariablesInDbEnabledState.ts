import { createState } from '@/ui/utilities/state/utils/createState';
export const isConfigVariablesInDbEnabledState = createState<boolean>({
  key: 'isConfigVariablesInDbEnabled',
  defaultValue: false,
});
