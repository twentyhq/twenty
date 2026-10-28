import { NavigationMenuItemType } from 'twenty-shared/types';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections';
import { NavigationMenuItemDndKitProvider } from '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider';
import { useNavigationMenuItemSectionLabel } from '@/navigation-menu-item/common/hooks/useNavigationMenuItemSectionLabel';
import { NavigationMenuItemEditableSectionPlaceholder } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemEditableSectionPlaceholder';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemFavoritesSectionProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemFavoritesSection = ({
  section,
}: NavigationMenuItemFavoritesSectionProps) => {
  const isMobile = useIsMobile();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { getDefaultSectionLabel } = useNavigationMenuItemSectionLabel();

  const defaultLabel = getDefaultSectionLabel(NavigationMenuItemType.FAVORITES);
  const label = section.name ?? defaultLabel;

  if (isLayoutCustomizationModeEnabled && !isMobile) {
    return (
      <NavigationMenuItemEditableSectionPlaceholder
        section={section}
        defaultName={defaultLabel}
      />
    );
  }

  return (
    <NavigationMenuItemDndKitProvider section={NavigationSections.FAVORITES}>
      <FavoritesSection title={label} />
    </NavigationMenuItemDndKitProvider>
  );
};
