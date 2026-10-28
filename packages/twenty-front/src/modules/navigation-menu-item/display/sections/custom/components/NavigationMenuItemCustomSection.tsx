import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemCustomSectionProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemCustomSection = ({
  section,
}: NavigationMenuItemCustomSectionProps) => {
  const isMobile = useIsMobile();
  const items = useNavigationMenuItemSectionItems(section.id);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const {
    selectedNavigationMenuItemId,
    onNavigationMenuItemClick,
    onActiveObjectMetadataItemClick,
  } = useWorkspaceSectionItemClickHandlers();
  const navigationSectionId =
    getNavigationMenuSectionNavigationSectionId(section);

  return (
    <WorkspaceSectionContainer
      sectionTitle={section.name ?? ''}
      items={items}
      containerId={section.id}
      navigationSectionId={navigationSectionId}
      isHiddenWhenEmpty
      visibleItemLimit={section.visibleItemLimit}
      rightIcon={
        !isMobile && isLayoutCustomizationModeEnabled ? (
          <NavigationMenuItemSectionMenu section={section} />
        ) : undefined
      }
      selectedNavigationMenuItemId={selectedNavigationMenuItemId}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );
};
