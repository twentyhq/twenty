import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hoveredNavigationMenuItemIdState = createAtomState<string | null>({
  key: 'hoveredNavigationMenuItemIdState',
  defaultValue: null,
});
