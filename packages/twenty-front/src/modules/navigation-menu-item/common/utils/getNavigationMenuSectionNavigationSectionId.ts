import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuSectionNavigationSectionId = (
  section: Pick<NavigationMenuItem, 'id' | 'builtInSectionKey'>,
) =>
  NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ key }) => key === section.builtInSectionKey,
  )?.navigationSectionId ?? `navigation-menu-section-${section.id}`;
