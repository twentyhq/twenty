import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const prefetchNavigationMenuItemsState = createStateV2<
  NavigationMenuItem[]
>({
  key: 'prefetchNavigationMenuItemsState',
  defaultValue: [],
});
