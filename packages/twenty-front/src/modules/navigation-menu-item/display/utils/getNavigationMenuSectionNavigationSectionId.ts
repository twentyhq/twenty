import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuSectionNavigationSectionId = (
  section: Pick<NavigationMenuItem, 'id'> &
    Partial<Pick<NavigationMenuItem, 'builtInSectionKey'>>,
) => {
  const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ key }) => key === section.builtInSectionKey,
  );

  return isDefined(builtInSection)
    ? builtInSection.navigationSectionId
    : `navigation-menu-section-${section.id}`;
};
