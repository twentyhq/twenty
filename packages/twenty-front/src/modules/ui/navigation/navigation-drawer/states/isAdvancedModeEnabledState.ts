import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isAdvancedModeEnabledState = createStateV2<boolean>({
  key: 'isAdvancedModeEnabledAtom',
  defaultValue: false,
  useLocalStorage: true,
});
