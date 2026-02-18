import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isFavoriteFolderCreatingStateV2 = createStateV2<boolean>({
  key: 'isFavoriteFolderCreatingStateV2',
  defaultValue: false,
});
