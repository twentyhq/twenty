import { useNavigateSidePanel } from '@/command-menu/hooks/useNavigateSidePanel';
import { type PageLayoutSidePanelPage } from '@/command-menu/pages/page-layout/types/PageLayoutSidePanelPage';
import { getPageLayoutIcon } from '@/command-menu/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/command-menu/pages/page-layout/utils/getPageLayoutPageTitle';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

type NavigatePageLayoutCommandMenuProps = {
  commandMenuPage: PageLayoutSidePanelPage;
  pageTitle?: string;
  pageIcon?: IconComponent;
  focusTitleInput?: boolean;
  resetNavigationStack?: boolean;
};

export const useNavigatePageLayoutSidePanel = () => {
  const { navigateCommandMenu } = useNavigateSidePanel();

  const navigatePageLayoutCommandMenu = useCallback(
    ({
      commandMenuPage,
      pageTitle,
      pageIcon,
      focusTitleInput = false,
      resetNavigationStack = false,
    }: NavigatePageLayoutCommandMenuProps) => {
      navigateCommandMenu({
        page: commandMenuPage,
        pageTitle: isDefined(pageTitle)
          ? pageTitle
          : getPageLayoutPageTitle(commandMenuPage),
        pageIcon: isDefined(pageIcon)
          ? pageIcon
          : getPageLayoutIcon(commandMenuPage),
        focusTitleInput,
        resetNavigationStack,
      });
    },
    [navigateCommandMenu],
  );

  return {
    navigatePageLayoutCommandMenu,
  };
};
