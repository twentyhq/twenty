import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isLayoutCustomizationActiveState = createAtomState<boolean>({
  key: 'isLayoutCustomizationActiveState',
  defaultValue: false,
});
