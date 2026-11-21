import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuTabAiOnly = ({
  tabId,
  navigationMenuItems,
}: {
  tabId: string;
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'parentId' | 'builtInSectionKey'
  >[];
}) => {
  const tabChildren = navigationMenuItems.filter(
    (item) => item.parentId === tabId,
  );

  return (
    tabChildren.length > 0 &&
    tabChildren.every((child) =>
      NAVIGATION_MENU_BUILT_IN_SECTIONS.some(
        ({ key, isAi }) => isAi && key === child.builtInSectionKey,
      ),
    )
  );
};
