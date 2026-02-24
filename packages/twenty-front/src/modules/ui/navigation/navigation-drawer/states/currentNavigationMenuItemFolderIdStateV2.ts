import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const currentNavigationMenuItemFolderIdStateV2 = createState<
  string | null
>({
  key: 'currentNavigationMenuItemFolderIdStateV2',
  defaultValue: null,
});
