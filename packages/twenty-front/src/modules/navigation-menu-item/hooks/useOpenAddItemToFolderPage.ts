import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { addMenuItemInsertionContextStateV2 } from '@/navigation-menu-item/states/addMenuItemInsertionContextStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/display';

type OpenAddItemToFolderPageParams = {
  targetFolderId: string;
  targetIndex: number;
  resetNavigationStack?: boolean;
};

export const useOpenAddItemToFolderPage = () => {
  const { t } = useLingui();
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setAddMenuItemInsertionContext = useSetRecoilStateV2(
    addMenuItemInsertionContextStateV2,
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
      pageIcon: IconPlus,
      resetNavigationStack,
    });
  };

  return { openAddItemToFolderPage };
};
