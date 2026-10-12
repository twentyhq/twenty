import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { getPageLayoutIcon } from '@/side-panel/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/side-panel/pages/page-layout/utils/getPageLayoutPageTitle';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

type NavigatePageLayoutSidePanelProps = {
  sidePanelPage: PageLayoutSidePanelPage;
  pageTitle?: string;
  pageIcon?: IconComponent;
  focusTitleInput?: boolean;
  resetNavigationStack?: boolean;
};

export const useNavigatePageLayoutSidePanel = () => {
  const { navigateSidePanel } = useNavigateSidePanel();

  // Provided by the rendered page layout, or by the side panel page this is
  // navigating from
  const pageLayoutSidePanelTarget = useContext(
    PageLayoutSidePanelTargetContext,
  );

  const navigatePageLayoutSidePanel = useCallback(
    ({
      sidePanelPage,
      pageTitle,
      pageIcon,
      focusTitleInput = false,
      resetNavigationStack = false,
    }: NavigatePageLayoutSidePanelProps) => {
      if (!isDefined(pageLayoutSidePanelTarget)) {
        throw new Error(
          'Cannot open a page layout side panel page outside of a page layout with a target record',
        );
      }

      navigateSidePanel({
        page: sidePanelPage,
        pageTitle: isDefined(pageTitle)
          ? pageTitle
          : getPageLayoutPageTitle(sidePanelPage),
        pageIcon: isDefined(pageIcon)
          ? pageIcon
          : getPageLayoutIcon(sidePanelPage),
        pageLayoutSidePanelTarget,
        focusTitleInput,
        resetNavigationStack,
      });
    },
    [navigateSidePanel, pageLayoutSidePanelTarget],
  );

  return {
    navigatePageLayoutSidePanel,
  };
};
