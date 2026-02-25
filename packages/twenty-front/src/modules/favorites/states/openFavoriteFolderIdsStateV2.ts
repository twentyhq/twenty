import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const openFavoriteFolderIdsStateV2 = createAtomState<string[]>({
  key: 'openFavoriteFolderIdsStateV2',
  defaultValue: [],
});
