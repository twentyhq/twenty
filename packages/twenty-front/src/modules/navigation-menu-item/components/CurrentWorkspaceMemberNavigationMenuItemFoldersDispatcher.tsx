import { CurrentWorkspaceMemberNavigationMenuItemFolders } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFolders';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { FavoritesDragDropProviderContent } from '@/navigation/components/FavoritesDragDropProviderContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = () => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isNavigationMenuInEditMode} initial>
      <FavoritesDragDropProviderContent>
        <CurrentWorkspaceMemberNavigationMenuItemFolders />
      </FavoritesDragDropProviderContent>
    </AnimatedEaseInOut>
  );
};
