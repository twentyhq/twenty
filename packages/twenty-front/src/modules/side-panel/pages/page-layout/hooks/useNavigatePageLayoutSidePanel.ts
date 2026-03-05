import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { getPageLayoutIcon } from '@/side-panel/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/side-panel/pages/page-layout/utils/getPageLayoutPageTitle';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

type NavigatePageLayoutSidePanelProps = {
  sidePanelPage: PageLayoutSidePanelPage;
  pageTitle?: string;
  pageIcon?: IconComponent;
  focusTitleInput?: boolean;
  resetNavigationStack?: boolean;
};

export const useNavigatePageLayoutSidePanel = () => {
  const { navigateSidePanel } = useNavigateSidePanel();

  const navigatePageLayoutSidePanel = useCallback(
    ({
      sidePanelPage,
      pageTitle,
      pageIcon,
      focusTitleInput = false,
      resetNavigationStack = false,
    }: NavigatePageLayoutSidePanelProps) => {
      navigateSidePanel({
        page: sidePanelPage,
        pageTitle: isDefined(pageTitle)
          ? pageTitle
          : getPageLayoutPageTitle(sidePanelPage),
        pageIcon: isDefined(pageIcon)
          ? pageIcon
          : getPageLayoutIcon(sidePanelPage),
        focusTitleInput,
        resetNavigationStack,
      });
    },
    [navigateSidePanel],
  );

  return {
    navigatePageLayoutSidePanel,
  };
};
