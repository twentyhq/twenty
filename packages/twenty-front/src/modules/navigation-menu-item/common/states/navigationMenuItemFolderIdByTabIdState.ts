import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuItemFolderIdByTabIdState = createAtomState<
  Record<string, string | null>
>({
  key: 'navigationMenuItemFolderIdByTabIdState',
  defaultValue: {},
});
