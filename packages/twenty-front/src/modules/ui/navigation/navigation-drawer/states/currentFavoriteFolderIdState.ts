import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentFavoriteFolderIdState = createAtomState<string | null>({
  key: 'currentFavoriteFolderIdState',
  defaultValue: null,
});
