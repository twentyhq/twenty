import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentFavoriteFolderIdStateV2 = createAtomState<string | null>({
  key: 'currentFavoriteFolderIdStateV2',
  defaultValue: null,
});
