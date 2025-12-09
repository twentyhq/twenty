import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { type PageLayoutCommandMenuPage } from '@/command-menu/pages/page-layout/types/PageLayoutCommandMenuPage';
import { getPageLayoutIcon } from '@/command-menu/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/command-menu/pages/page-layout/utils/getPageLayoutPageTitle';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

type NavigatePageLayoutCommandMenuProps = {
  commandMenuPage: PageLayoutCommandMenuPage;
  pageTitle?: string;
  pageIcon?: IconComponent;
  focusTitleInput?: boolean;
  resetNavigationStack?: boolean;
};

export const useNavigatePageLayoutCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const navigatePageLayoutCommandMenu = useRecoilCallback(() => {
    return ({
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
    };
  }, [navigateCommandMenu]);

  return {
    navigatePageLayoutCommandMenu,
  };
};
