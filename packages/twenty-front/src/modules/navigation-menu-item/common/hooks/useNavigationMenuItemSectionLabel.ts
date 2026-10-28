import { useLingui } from '@lingui/react/macro';

import { NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuItemBuiltInSections';
import { type NavigationMenuItemBuiltInSectionType } from '@/navigation-menu-item/common/types/NavigationMenuItemBuiltInSectionType';

export const useNavigationMenuItemSectionLabel = () => {
  const { i18n } = useLingui();

  const getDefaultSectionLabel = (type: NavigationMenuItemBuiltInSectionType) =>
    i18n._(NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS[type].label);

  return { getDefaultSectionLabel };
};
