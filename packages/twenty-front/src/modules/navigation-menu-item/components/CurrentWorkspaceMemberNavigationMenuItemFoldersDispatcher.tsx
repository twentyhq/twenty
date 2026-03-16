import { CurrentWorkspaceMemberNavigationMenuItemFolders } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFolders';
import { isLayoutCustomizationModeEnabledState } from '@/app/states/isLayoutCustomizationModeEnabledState';
import { FavoritesDragDropProviderContent } from '@/navigation/components/FavoritesDragDropProviderContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isLayoutCustomizationModeEnabled} initial>
      <FavoritesDragDropProviderContent>
        <CurrentWorkspaceMemberNavigationMenuItemFolders />
      </FavoritesDragDropProviderContent>
    </AnimatedEaseInOut>
  );
};
