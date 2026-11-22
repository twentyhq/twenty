import { type BuiltInSectionKey } from 'twenty-shared/types';
import { isBuiltInSectionKey, isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const AI_CHAT_BUILT_IN_SECTION_KEYS: BuiltInSectionKey[] =
  NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(({ isAi }) => isAi).map(
    ({ key }) => key,
  );

const HOME_TAB_ID = null;

export const getNavigationMenuTabIdsWithChatSections = (
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'parentId' | 'builtInSectionKey'
  >[],
) =>
  new Set(
    navigationMenuItems.flatMap((item) =>
      isBuiltInSectionKey(item.builtInSectionKey) &&
      AI_CHAT_BUILT_IN_SECTION_KEYS.includes(item.builtInSectionKey)
        ? [isDefined(item.parentId) ? item.parentId : HOME_TAB_ID]
        : [],
    ),
  );
