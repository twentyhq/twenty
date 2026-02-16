import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isNavigationMenuItemFolderCreatingStateV2 = createStateV2<boolean>(
  {
    key: 'isNavigationMenuItemFolderCreatingStateV2',
    defaultValue: false,
  },
);
