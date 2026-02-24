import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const prefetchNavigationMenuItemsState = createState<
  NavigationMenuItem[]
>({
  key: 'prefetchNavigationMenuItemsState',
  defaultValue: [],
});
