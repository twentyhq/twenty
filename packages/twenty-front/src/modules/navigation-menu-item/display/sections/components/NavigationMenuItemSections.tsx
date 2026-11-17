import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { NavigationMenuItemCustomSection } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemSectionsProps = {
  containerId: string | null;
};

export const NavigationMenuItemSections = ({
  containerId,
}: NavigationMenuItemSectionsProps) => {
  const sections = useWorkspaceNavigationMenuSections(containerId);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  if (isLayoutCustomizationModeEnabled) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <NavigationMenuItemCustomSection key={section.id} section={section} />
      ))}
    </>
  );
};
