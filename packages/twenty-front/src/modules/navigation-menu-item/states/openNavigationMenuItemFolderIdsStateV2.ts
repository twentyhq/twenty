import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const openNavigationMenuItemFolderIdsStateV2 = createState<string[]>({
  key: 'openNavigationMenuItemFolderIdsStateV2',
  defaultValue: [],
});
