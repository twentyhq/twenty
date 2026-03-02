import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconColumnInsertRight } from 'twenty-ui/display';

type OpenAddItemToFolderPageParams = {
  targetFolderId: string;
  targetIndex: number;
  resetNavigationStack?: boolean;
};

export const useOpenAddItemToFolderPage = () => {
  const { t } = useLingui();
  const { navigateCommandMenu } = useNavigateCommandMenu();
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
    navigateCommandMenu({
      page: CommandMenuPages.NavigationMenuAddItem,
      pageTitle: t`New sidebar item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack,
    });
  };

  return { openAddItemToFolderPage };
};
