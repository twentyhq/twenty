import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentNavigationMenuItemFolderIdStateV2 = createStateV2<
  string | null
>({
  key: 'currentNavigationMenuItemFolderIdStateV2',
  defaultValue: null,
});
