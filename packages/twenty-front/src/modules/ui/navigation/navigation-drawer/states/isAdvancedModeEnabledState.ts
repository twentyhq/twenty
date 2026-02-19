import { createStateWithLocalStorageV2 } from '@/ui/utilities/state/jotai/utils/createStateWithLocalStorageV2';

export const isAdvancedModeEnabledState =
  createStateWithLocalStorageV2<boolean>({
    key: 'isAdvancedModeEnabledAtom',
    defaultValue: false,
  });
