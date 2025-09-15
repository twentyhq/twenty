import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { getPageLayoutIcon } from '@/command-menu/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/command-menu/pages/page-layout/utils/getPageLayoutPageTitle';
import { type CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStorePageLayoutIdComponentState } from '@/context-store/states/contextStorePageLayoutIdComponentState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';

type NavigatePageLayoutCommandMenuProps = {
  pageLayoutId: string;
  commandMenuPage:
    | CommandMenuPages.PageLayoutWidgetTypeSelect
    | CommandMenuPages.PageLayoutGraphTypeSelect
    | CommandMenuPages.PageLayoutIframeConfig;
  pageTitle?: string;
  pageIcon?: IconComponent;
};

export const useNavigatePageLayoutCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const navigatePageLayoutCommandMenu = useRecoilCallback(
    ({ set }) => {
      return ({
        pageLayoutId,
        commandMenuPage,
        pageTitle,
        pageIcon,
      }: NavigatePageLayoutCommandMenuProps) => {
        const pageComponentInstanceId = v4();

        set(
          contextStorePageLayoutIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          pageLayoutId,
        );

        navigateCommandMenu({
          page: commandMenuPage,
          pageTitle: isDefined(pageTitle)
            ? pageTitle
            : getPageLayoutPageTitle(commandMenuPage),
          pageIcon: isDefined(pageIcon)
            ? pageIcon
            : getPageLayoutIcon(commandMenuPage),
          pageId: pageComponentInstanceId,
        });
      };
    },
    [navigateCommandMenu],
  );

  return {
    navigatePageLayoutCommandMenu,
  };
};
