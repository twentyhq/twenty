import { type BuiltInSectionKey } from 'twenty-shared/types';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';

export const AI_CHAT_BUILT_IN_SECTION_KEYS: BuiltInSectionKey[] =
  NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(({ isAi }) => isAi).map(
    ({ key }) => key,
  );
