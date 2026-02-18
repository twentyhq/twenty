import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const openNavigationMenuItemFolderIdsStateV2 = createStateV2<string[]>({
  key: 'openNavigationMenuItemFolderIdsStateV2',
  defaultValue: [],
});
