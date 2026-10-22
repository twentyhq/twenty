import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsPathOpenedFromNavigationMenuState = createAtomState<
  string | null
>({
  key: 'settingsPathOpenedFromNavigationMenuState',
  defaultValue: null,
});
