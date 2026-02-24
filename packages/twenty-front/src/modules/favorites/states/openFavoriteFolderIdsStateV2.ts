import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const openFavoriteFolderIdsStateV2 = createState<string[]>({
  key: 'openFavoriteFolderIdsStateV2',
  defaultValue: [],
});
