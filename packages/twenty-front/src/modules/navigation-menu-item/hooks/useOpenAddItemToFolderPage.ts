import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconColumnInsertRight } from 'twenty-ui/display';

type OpenAddItemToFolderPageParams = {
  targetFolderId: string;
  targetIndex: number;
  resetNavigationStack?: boolean;
};

export const useOpenAddItemToFolderPage = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextState,
  );

  const openAddItemToFolderPage = ({
    targetFolderId,
    targetIndex,
    resetNavigationStack = true,
  }: OpenAddItemToFolderPageParams) => {
    setAddMenuItemInsertionContext({
      targetFolderId,
      targetIndex,
    });
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuAddItem,
      pageTitle: t`New sidebar item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack,
    });
  };

  return { openAddItemToFolderPage };
};
