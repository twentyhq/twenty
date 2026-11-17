import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NavigationMenuSection } from '@/navigation-menu-item/display/containers/components/NavigationMenuSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuSectionListProps = {
  containerId: string | null;
};

export const NavigationMenuSectionList = ({
  containerId,
}: NavigationMenuSectionListProps) => {
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId,
  });
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  if (isLayoutCustomizationModeEnabled) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <NavigationMenuSection key={section.id} section={section} />
      ))}
    </>
  );
};
