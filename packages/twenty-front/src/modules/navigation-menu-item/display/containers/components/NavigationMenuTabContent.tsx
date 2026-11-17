import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { NavigationMenuSectionList } from '@/navigation-menu-item/display/containers/components/NavigationMenuSectionList';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuTabContentProps = {
  tab: Pick<NavigationMenuItem, 'id'>;
};

export const NavigationMenuTabContent = ({
  tab,
}: NavigationMenuTabContentProps) => {
  const { topLevelItems, folderChildrenById } = useNavigationMenuContainerItems(
    tab.id,
  );

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
