import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isNavigationMenuItemFolderCreatingStateV2 = createState<boolean>({
  key: 'isNavigationMenuItemFolderCreatingStateV2',
  defaultValue: false,
});
