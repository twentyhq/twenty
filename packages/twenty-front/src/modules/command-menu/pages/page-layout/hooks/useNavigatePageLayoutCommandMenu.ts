import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { getPageLayoutIcon } from '@/command-menu/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/command-menu/pages/page-layout/utils/getPageLayoutPageTitle';
import { type CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

type NavigatePageLayoutCommandMenuProps = {
  commandMenuPage:
    | CommandMenuPages.PageLayoutWidgetTypeSelect
    | CommandMenuPages.PageLayoutGraphTypeSelect
    | CommandMenuPages.PageLayoutIframeConfig;
  pageTitle?: string;
  pageIcon?: IconComponent;
};

export const useNavigatePageLayoutCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const navigatePageLayoutCommandMenu = useRecoilCallback(() => {
    return ({
      commandMenuPage,
      pageTitle,
      pageIcon,
    }: NavigatePageLayoutCommandMenuProps) => {
      navigateCommandMenu({
        page: commandMenuPage,
        pageTitle: isDefined(pageTitle)
          ? pageTitle
          : getPageLayoutPageTitle(commandMenuPage),
        pageIcon: isDefined(pageIcon)
          ? pageIcon
          : getPageLayoutIcon(commandMenuPage),
      });
    };
  }, [navigateCommandMenu]);

  return {
    navigatePageLayoutCommandMenu,
  };
};
