import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const selectedNavigationMenuItemInEditModeStateV2 = createStateV2<
  string | null
>({
  key: 'selectedNavigationMenuItemInEditModeStateV2',
  defaultValue: null,
});
