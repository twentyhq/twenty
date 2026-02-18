import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const openFavoriteFolderIdsStateV2 = createStateV2<string[]>({
  key: 'openFavoriteFolderIdsStateV2',
  defaultValue: [],
});
