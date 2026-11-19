import { NavigationMenuContainerEditableItems } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerEditableItems';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { StyledNavigationMenuItemSectionContentGapOffset } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuItemSectionContentGapOffset';
import { NavigationMenuSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuSectionMenu';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';

type NavigationMenuEditableSectionProps = {
  section: Pick<
    NamedNavigationMenuItem,
    'id' | 'name' | 'icon' | 'parentId' | 'type'
  >;
};

export const NavigationMenuEditableSection = ({
  section,
}: NavigationMenuEditableSectionProps) => {
  const { isNavigationSectionOpen, toggleNavigationSection } =
    useNavigationSection(`navigation-menu-section-${section.id}`);
  const { topLevelItems, folderChildrenById } = useNavigationMenuContainerItems(
    section.id,
  );

  return (
    <NavigationMenuItemSection
      title={section.name}
      isOpen={isNavigationSectionOpen}
      onToggle={() => toggleNavigationSection()}
      rightIcon={<NavigationMenuSectionMenu section={section} />}
      alwaysShowRightIcon
      contentWrapper={(children) => (
        <StyledNavigationMenuItemSectionContentGapOffset>
          {children}
        </StyledNavigationMenuItemSectionContentGapOffset>
      )}
    >
      <NavigationMenuContainerEditableItems
        containerId={section.id}
        topLevelItems={topLevelItems}
        folderChildrenById={folderChildrenById}
      />
    </NavigationMenuItemSection>
  );
};
