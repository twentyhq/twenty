import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuContainerEditableItems } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerEditableItems';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { NavigationMenuSectionList } from '@/navigation-menu-item/display/containers/components/NavigationMenuSectionList';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuTabContentProps = {
  tab: Pick<NavigationMenuItem, 'id'>;
};

export const NavigationMenuTabContent = ({
  tab,
}: NavigationMenuTabContentProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { topLevelItems, folderChildrenById } = useNavigationMenuContainerItems(
    tab.id,
  );

  if (isLayoutCustomizationModeEnabled) {
    return (
      <>
        <NavigationDrawerSection>
          <NavigationMenuContainerEditableItems
            containerId={tab.id}
            topLevelItems={topLevelItems}
            folderChildrenById={folderChildrenById}
          />
        </NavigationDrawerSection>
        <NavigationMenuSectionList containerId={tab.id} />
      </>
    );
  }

  return (
    <>
      {topLevelItems.length > 0 && (
        <NavigationDrawerSection>
          <WorkspaceSectionListReadOnly
            filteredItems={topLevelItems}
            folderChildrenById={folderChildrenById}
          />
        </NavigationDrawerSection>
      )}
      <NavigationMenuSectionList containerId={tab.id} />
    </>
  );
};
