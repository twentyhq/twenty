import { styled } from '@linaria/react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimit';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { StyledNavigationMenuItemSectionContentGapOffset } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuItemSectionContentGapOffset';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';

const StyledSectionContextMenuTarget = styled.div`
  display: contents;
`;

type NavigationMenuSectionProps = {
  section: Pick<NamedNavigationMenuItem, 'id' | 'name'>;
};

export const NavigationMenuSection = ({
  section,
}: NavigationMenuSectionProps) => {
  const { isNavigationSectionOpen, toggleNavigationSection } =
    useNavigationSection(getNavigationMenuSectionNavigationSectionId(section));
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
    <StyledSectionContextMenuTarget
      data-navigation-menu-section-id={section.id}
    >
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
            sectionId={section.id}
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
    </StyledSectionContextMenuTarget>
  );
};
