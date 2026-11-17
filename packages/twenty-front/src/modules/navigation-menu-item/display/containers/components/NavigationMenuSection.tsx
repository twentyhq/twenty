import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimit';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { StyledNavigationMenuItemSectionContentGapOffset } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuItemSectionContentGapOffset';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';

type NavigationMenuSectionProps = {
  section: Pick<NamedNavigationMenuItem, 'id' | 'name'>;
};

export const NavigationMenuSection = ({
  section,
}: NavigationMenuSectionProps) => {
  const { t } = useLingui();
  const [isShowingAllItems, setIsShowingAllItems] = useState(false);
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

  const displayedItems =
    hasHiddenItems && !isShowingAllItems
      ? topLevelItems.slice(0, NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT)
      : topLevelItems;

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
        filteredItems={displayedItems}
        folderChildrenById={folderChildrenById}
      />
      {hasHiddenItems && (
        <NavigationDrawerItem
          label={isShowingAllItems ? t`See less` : t`See more`}
          Icon={isShowingAllItems ? IconChevronUp : IconChevronDown}
          variant="tertiary"
          preventCollapseOnMobile
          onClick={() => setIsShowingAllItems(!isShowingAllItems)}
        />
      )}
    </NavigationMenuItemSection>
  );
};
