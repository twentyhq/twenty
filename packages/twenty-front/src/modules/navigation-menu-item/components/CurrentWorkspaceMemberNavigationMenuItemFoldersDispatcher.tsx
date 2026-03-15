import { CurrentWorkspaceMemberNavigationMenuItemFolders } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFolders';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { FavoritesDragDropProviderContent } from '@/navigation/components/FavoritesDragDropProviderContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

export const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = () => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  return (
    <AnimatedEaseInOut isOpen={!isLayoutCustomizationActive} initial>
      <FavoritesDragDropProviderContent>
        <CurrentWorkspaceMemberNavigationMenuItemFolders />
      </FavoritesDragDropProviderContent>
    </AnimatedEaseInOut>
  );
};
