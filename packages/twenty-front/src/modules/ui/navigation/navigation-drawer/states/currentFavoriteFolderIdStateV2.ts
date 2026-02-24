import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const currentFavoriteFolderIdStateV2 = createState<string | null>({
  key: 'currentFavoriteFolderIdStateV2',
  defaultValue: null,
});
