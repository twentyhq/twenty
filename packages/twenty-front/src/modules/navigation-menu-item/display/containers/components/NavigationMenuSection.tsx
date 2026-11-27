import { styled } from '@linaria/react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { getNavigationSectionVisibleItems } from '@/navigation-menu-item/display/utils/getNavigationSectionVisibleItems';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { StyledNavigationMenuItemSectionContentGapOffset } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuItemSectionContentGapOffset';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';

const StyledSectionContextMenuTarget = styled.div`
  display: contents;
`;

type NavigationMenuSectionProps = {
  section: Pick<NamedNavigationMenuItem, 'id' | 'name' | 'visibleItemLimit'>;
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

  const { visibleItems, hiddenItems, hasHiddenItems } =
    getNavigationSectionVisibleItems({
      items: topLevelItems,
      visibleItemLimit: section.visibleItemLimit,
    });
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
