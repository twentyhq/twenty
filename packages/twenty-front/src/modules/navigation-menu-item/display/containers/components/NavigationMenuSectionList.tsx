import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { NavigationMenuBuiltInSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuBuiltInSection';
import { NavigationMenuEditableBuiltInSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuEditableBuiltInSection';
import { NavigationMenuEditableSection } from '@/navigation-menu-item/display/containers/components/NavigationMenuEditableSection';
import { NavigationMenuSection } from '@/navigation-menu-item/display/containers/components/NavigationMenuSection';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NavigationMenuAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuAddSectionButton';
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
    return (
      <>
        {sections.map((section) =>
          isNavigationMenuItemBuiltInSection(section) ? (
            <NavigationMenuEditableBuiltInSection
              key={section.id}
              section={section}
            />
          ) : (
            <NavigationMenuEditableSection key={section.id} section={section} />
          ),
        )}
        <NavigationMenuAddSectionButton containerId={containerId} />
      </>
    );
  }

  return (
    <>
      {sections.map((section) =>
        isNavigationMenuItemBuiltInSection(section) ? (
          <NavigationMenuBuiltInSection key={section.id} section={section} />
        ) : (
          <NavigationMenuSection key={section.id} section={section} />
        ),
      )}
    </>
  );
};
