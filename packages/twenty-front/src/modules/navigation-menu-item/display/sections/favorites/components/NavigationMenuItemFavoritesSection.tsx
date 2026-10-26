import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections';
import { NavigationMenuItemDndKitProvider } from '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider';
import { useNavigationMenuItemAiChatSectionLabel } from '@/navigation-menu-item/display/sections/ai-chat/hooks/useNavigationMenuItemAiChatSectionLabel';
import { FavoritesSection } from '@/navigation-menu-item/display/sections/favorites/components/FavoritesSection';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
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
  const { getDefaultAiChatSectionLabel } =
    useNavigationMenuItemAiChatSectionLabel();

  const defaultLabel = getDefaultAiChatSectionLabel(section.type);
  const label = section.name ?? defaultLabel;

  if (isLayoutCustomizationModeEnabled && !isMobile) {
    return (
      <CollapsibleNavigationDrawerSection
        sectionId={getNavigationMenuSectionNavigationSectionId(section)}
        label={label}
        rightIcon={
          <NavigationMenuItemSectionMenu
            section={section}
            defaultName={defaultLabel}
          />
        }
        alwaysShowRightIcon
      >
        {null}
      </CollapsibleNavigationDrawerSection>
    );
  }

  return (
    <NavigationMenuItemDndKitProvider section={NavigationSections.FAVORITES}>
      <FavoritesSection title={label} />
    </NavigationMenuItemDndKitProvider>
  );
};
