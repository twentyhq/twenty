import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isFavoriteFolderCreatingStateV2 = createState<boolean>({
  key: 'isFavoriteFolderCreatingStateV2',
  defaultValue: false,
});
