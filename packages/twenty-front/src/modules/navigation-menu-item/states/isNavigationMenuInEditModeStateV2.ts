import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isNavigationMenuInEditModeStateV2 = createState<boolean>({
  key: 'isNavigationMenuInEditModeStateV2',
  defaultValue: false,
});
