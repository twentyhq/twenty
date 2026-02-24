import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const selectedNavigationMenuItemInEditModeStateV2 = createState<
  string | null
>({
  key: 'selectedNavigationMenuItemInEditModeStateV2',
  defaultValue: null,
});
