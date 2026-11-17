import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemBuiltInSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  NAVIGATION_MENU_BUILT_IN_SECTIONS.some(
    (builtInSection) => builtInSection.type === item.type,
  );
