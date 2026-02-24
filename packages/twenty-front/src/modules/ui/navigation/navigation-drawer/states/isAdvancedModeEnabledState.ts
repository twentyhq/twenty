import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isAdvancedModeEnabledState = createState<boolean>({
  key: 'isAdvancedModeEnabledAtom',
  defaultValue: false,
  useLocalStorage: true,
});
