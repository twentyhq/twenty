import { createState } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const prefetchNavigationMenuItemsState = createState<
  NavigationMenuItem[]
>({
  key: 'prefetchNavigationMenuItemsState',
  defaultValue: [],
});
