import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimit';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemCustomSectionProps = {
  section: Pick<NavigationMenuItem, 'id' | 'name'>;
};

export const NavigationMenuItemCustomSection = ({
  section,
}: NavigationMenuItemCustomSectionProps) => {
  const items = useNavigationMenuItemSectionItems(section.id);

  return (
    <WorkspaceSectionContainer
      sectionTitle={section.name ?? ''}
      items={items}
      containerId={section.id}
      navigationSectionId={`navigation-menu-section-${section.id}`}
      isReadOnly
      isHiddenWhenEmpty
      visibleItemLimit={NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT}
    />
  );
};
