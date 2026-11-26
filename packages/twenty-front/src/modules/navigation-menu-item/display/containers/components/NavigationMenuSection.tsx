import { NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimit';
import { isNavigationMenuSectionShowingAllItemsFamilyState } from '@/navigation-menu-item/common/states/isNavigationMenuSectionShowingAllItemsFamilyState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { StyledNavigationMenuItemSectionContentGapOffset } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuItemSectionContentGapOffset';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

type NavigationMenuSectionProps = {
  section: Pick<NamedNavigationMenuItem, 'id' | 'name'>;
};

export const NavigationMenuSection = ({
  section,
}: NavigationMenuSectionProps) => {
  const [isShowingAllItems, setIsShowingAllItems] = useAtomFamilyState(
    isNavigationMenuSectionShowingAllItemsFamilyState,
    section.id,
  );
  const { isNavigationSectionOpen, toggleNavigationSection } =
    useNavigationSection(`navigation-menu-section-${section.id}`);
  const { topLevelItems, folderChildrenById } = useNavigationMenuContainerItems(
    section.id,
  );

  if (topLevelItems.length === 0) {
    return null;
  }

  const hasHiddenItems =
    topLevelItems.length > NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT;

  const visibleItems = topLevelItems.slice(
    0,
    NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT,
  );
  const hiddenItems = topLevelItems.slice(
    NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT,
  );
  const folderCount = topLevelItems.filter(
    (item) => item.type === NavigationMenuItemType.FOLDER,
  ).length;

  return (
    <NavigationMenuItemSection
      title={section.name}
      isOpen={isNavigationSectionOpen}
      onToggle={() => toggleNavigationSection()}
      contentWrapper={(children) => (
        <StyledNavigationMenuItemSectionContentGapOffset>
          {children}
        </StyledNavigationMenuItemSectionContentGapOffset>
      )}
    >
      <WorkspaceSectionListReadOnly
        filteredItems={visibleItems}
        folderChildrenById={folderChildrenById}
        folderCount={folderCount}
      />
      {hasHiddenItems && (
        <NavigationMenuSectionSeeMore
          isShowingAllItems={isShowingAllItems}
          onToggle={() => setIsShowingAllItems(!isShowingAllItems)}
          hiddenItems={
            <WorkspaceSectionListReadOnly
              filteredItems={hiddenItems}
              folderChildrenById={folderChildrenById}
              folderCount={folderCount}
            />
          }
        />
      )}
    </NavigationMenuItemSection>
  );
};
