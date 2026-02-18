import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentFavoriteFolderIdStateV2 = createStateV2<string | null>({
  key: 'currentFavoriteFolderIdStateV2',
  defaultValue: null,
});
