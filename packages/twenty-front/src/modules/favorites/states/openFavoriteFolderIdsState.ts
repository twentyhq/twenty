import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const openFavoriteFolderIdsState = createAtomState<string[]>({
  key: 'openFavoriteFolderIdsState',
  defaultValue: [],
});
