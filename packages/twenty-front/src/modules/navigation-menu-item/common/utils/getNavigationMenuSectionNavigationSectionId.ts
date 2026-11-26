import { isBuiltInSectionKey } from 'twenty-shared/utils';

import { NAVIGATION_SECTION_ID_BY_BUILT_IN_SECTION_KEY } from '@/navigation-menu-item/common/constants/NavigationSectionIdByBuiltInSectionKey';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuSectionNavigationSectionId = (
  section: Pick<NavigationMenuItem, 'id' | 'builtInSectionKey'>,
) =>
  isBuiltInSectionKey(section.builtInSectionKey)
    ? NAVIGATION_SECTION_ID_BY_BUILT_IN_SECTION_KEY[section.builtInSectionKey]
    : `navigation-menu-section-${section.id}`;
