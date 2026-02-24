import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isConfigVariablesInDbEnabledState = createState<boolean>({
  key: 'isConfigVariablesInDbEnabled',
  defaultValue: false,
});
