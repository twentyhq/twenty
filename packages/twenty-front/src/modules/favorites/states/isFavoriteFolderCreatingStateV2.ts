import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isFavoriteFolderCreatingStateV2 = createAtomState<boolean>({
  key: 'isFavoriteFolderCreatingStateV2',
  defaultValue: false,
});
