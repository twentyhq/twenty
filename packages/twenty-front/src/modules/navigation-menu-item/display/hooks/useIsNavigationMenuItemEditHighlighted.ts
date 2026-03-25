import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const useIsNavigationMenuItemEditHighlighted = (
  navigationMenuItem: Pick<NavigationMenuItem, 'id' | 'folderId'>,
): boolean => {
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const pendingInsertionNavigationMenuItem = useAtomStateValue(
    pendingInsertionNavigationMenuItemState,
  );
  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const isSelectedById =
    selectedNavigationMenuItemIdInEditMode === navigationMenuItem.id;
  const isPendingInsertionMatch =
    isDefined(pendingInsertionNavigationMenuItem) &&
    pendingInsertionNavigationMenuItem.folderId === navigationMenuItem.id &&
    (sidePanelPage === SidePanelPages.NavigationMenuAddItem ||
      sidePanelPage === SidePanelPages.NavigationMenuItemEdit);
  return isSelectedById || isPendingInsertionMatch;
};
