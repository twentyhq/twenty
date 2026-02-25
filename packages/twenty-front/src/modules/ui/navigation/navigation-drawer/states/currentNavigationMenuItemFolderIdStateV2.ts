import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentNavigationMenuItemFolderIdStateV2 = createAtomState<
  string | null
>({
  key: 'currentNavigationMenuItemFolderIdStateV2',
  defaultValue: null,
});
