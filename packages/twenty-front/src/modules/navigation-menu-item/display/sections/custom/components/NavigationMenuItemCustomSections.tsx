import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { NavigationMenuItemCustomSection } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSection';
import { NavigationMenuItemAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddSectionButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

type NavigationMenuItemCustomSectionsProps = {
  parentId: string | null;
};

export const NavigationMenuItemCustomSections = ({
  parentId,
}: NavigationMenuItemCustomSectionsProps) => {
  const isMobile = useIsMobile();
  const sections = useWorkspaceNavigationMenuSections(parentId);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <>
      {sections.map((section) => (
        <NavigationMenuItemCustomSection key={section.id} section={section} />
      ))}
      {isLayoutCustomizationModeEnabled && !isMobile && (
        <NavigationMenuItemAddSectionButton parentId={parentId} />
      )}
    </>
  );
};
