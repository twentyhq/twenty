import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconColumnInsertRight } from 'twenty-ui/display';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type OpenAddItemToFolderPageParams = {
  folderId: string;
  position: number;
  resetNavigationStack?: boolean;
};

export const useOpenAddItemToFolderPage = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const setPendingInsertionNavigationMenuItem = useSetAtomState(
    pendingInsertionNavigationMenuItemState,
  );
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );

  const openAddItemToFolderPage = ({
    folderId,
    position,
    resetNavigationStack = true,
  }: OpenAddItemToFolderPageParams) => {
    setPendingInsertionNavigationMenuItem({ folderId, position });
    setSelectedNavigationMenuItemIdInEditMode(null);
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuAddItem,
      pageTitle: t`New menu item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack,
    });
  };

  return { openAddItemToFolderPage };
};
