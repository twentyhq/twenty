import { isBuiltInSectionKey } from 'twenty-shared/utils';

import { NAVIGATION_MENU_BUILT_IN_SECTION_NAVIGATION_SECTION_IDS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSectionNavigationSectionIds';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuSectionNavigationSectionId = (
  section: Pick<NavigationMenuItem, 'id'> &
    Partial<Pick<NavigationMenuItem, 'builtInSectionKey'>>,
) =>
  isBuiltInSectionKey(section.builtInSectionKey)
    ? NAVIGATION_MENU_BUILT_IN_SECTION_NAVIGATION_SECTION_IDS[
        section.builtInSectionKey
      ]
    : `navigation-menu-section-${section.id}`;
