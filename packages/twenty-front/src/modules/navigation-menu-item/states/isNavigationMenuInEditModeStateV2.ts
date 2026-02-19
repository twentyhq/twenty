import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isNavigationMenuInEditModeStateV2 = createStateV2<boolean>({
  key: 'isNavigationMenuInEditModeStateV2',
  defaultValue: false,
});
