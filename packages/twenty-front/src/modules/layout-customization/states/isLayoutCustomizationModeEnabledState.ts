import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isLayoutCustomizationModeEnabledState = createAtomState<boolean>({
  key: 'isLayoutCustomizationModeEnabledState',
  defaultValue: false,
});
