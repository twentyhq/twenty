import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isFavoriteFolderCreatingState = createAtomState<boolean>({
  key: 'isFavoriteFolderCreatingState',
  defaultValue: false,
});
