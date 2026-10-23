import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { isNavigationMenuItemSectionAboveContainerItems } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSectionAboveContainerItems';
import { NavigationMenuItemAiChatSection } from '@/navigation-menu-item/display/sections/ai-chat/components/NavigationMenuItemAiChatSection';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { NavigationMenuItemCustomSection } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSection';
import { NavigationMenuItemAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddSectionButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

type NavigationMenuItemCustomSectionsProps = {
  parentId: string | null;
  placement: 'above-items' | 'below-items';
};

export const NavigationMenuItemCustomSections = ({
  parentId,
  placement,
}: NavigationMenuItemCustomSectionsProps) => {
  const isMobile = useIsMobile();
  const isAboveItems = placement === 'above-items';
  const sections = useWorkspaceNavigationMenuSections(parentId).filter(
    (section) =>
      isNavigationMenuItemSectionAboveContainerItems(section) === isAboveItems,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <>
      {sections.map((section) =>
        isNavigationMenuItemAiChatSection(section) ? (
          <NavigationMenuItemAiChatSection key={section.id} section={section} />
        ) : (
          <NavigationMenuItemCustomSection key={section.id} section={section} />
        ),
      )}
      {!isAboveItems && isLayoutCustomizationModeEnabled && !isMobile && (
        <NavigationMenuItemAddSectionButton parentId={parentId} />
      )}
    </>
  );
};
