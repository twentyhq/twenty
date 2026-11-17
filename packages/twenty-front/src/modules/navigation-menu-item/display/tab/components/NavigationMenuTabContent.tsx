import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { NavigationMenuItemSections } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSections';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuTabContentProps = {
  tab: NavigationMenuItem;
};

export const NavigationMenuTabContent = ({
  tab,
}: NavigationMenuTabContentProps) => {
  const items = useNavigationMenuItemSectionItems(tab.id);

  return (
    <>
      {items.length > 0 && (
        <WorkspaceSectionContainer
          sectionTitle={tab.name ?? ''}
          items={items}
          containerId={tab.id}
          navigationSectionId={`navigation-menu-tab-${tab.id}`}
          isTitleHidden
          isReadOnly
        />
      )}
      <NavigationMenuItemSections containerId={tab.id} />
    </>
  );
};
