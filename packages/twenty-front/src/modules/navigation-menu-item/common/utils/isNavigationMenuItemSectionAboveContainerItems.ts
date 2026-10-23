import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION } from '@/navigation-menu-item/common/constants/NavigationMenuContainerItemsSectionPosition';

export const isNavigationMenuItemSectionAboveContainerItems = (
  section: Pick<NavigationMenuItem, 'position'>,
) => section.position < NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION;
