import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentNavigationMenuItemFolderIdState = createAtomState<
  string | null
>({
  key: 'currentNavigationMenuItemFolderIdState',
  defaultValue: null,
});
