import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { NavigationMenuBuiltInSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuBuiltInSection';
import { NavigationMenuEditableBuiltInSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuEditableBuiltInSection';
import { NavigationMenuEditableSection } from '@/navigation-menu-item/display/containers/components/NavigationMenuEditableSection';
import { NavigationMenuSection } from '@/navigation-menu-item/display/containers/components/NavigationMenuSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuSectionRendererProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuSectionRenderer = ({
  section,
}: NavigationMenuSectionRendererProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const namedSection = { ...section, name: section.name ?? '' };

  if (isNavigationMenuItemBuiltInSection(section)) {
    return isLayoutCustomizationModeEnabled ? (
      <NavigationMenuEditableBuiltInSection section={namedSection} />
    ) : (
      <NavigationMenuBuiltInSection section={namedSection} />
    );
  }

  return isLayoutCustomizationModeEnabled ? (
    <NavigationMenuEditableSection section={namedSection} />
  ) : (
    <NavigationMenuSection section={namedSection} />
  );
};
