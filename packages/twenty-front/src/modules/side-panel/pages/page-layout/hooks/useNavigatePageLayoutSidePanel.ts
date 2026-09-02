import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { type PageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelPage';
import { getPageLayoutSidePanelContext } from '@/side-panel/pages/page-layout/utils/getPageLayoutSidePanelContext';
import { getPageLayoutIcon } from '@/side-panel/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/side-panel/pages/page-layout/utils/getPageLayoutPageTitle';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useStore } from 'jotai';
import { useCallback } from 'react';
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
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const workspaceSurface = useWorkspaceSurface();

  const navigatePageLayoutSidePanel = useCallback(
    ({
      sidePanelPage,
      pageTitle,
      pageIcon,
      focusTitleInput = false,
      resetNavigationStack = false,
    }: NavigatePageLayoutSidePanelProps) => {
      const pageLayoutContext = getPageLayoutSidePanelContext({
        store,
        sidePanelPageInstanceId:
          workspaceSurface.type === 'side-panel'
            ? workspaceSurface.instanceId
            : undefined,
      });

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
        ...(isDefined(pageLayoutContext) ? { pageLayoutContext } : {}),
      });
    },
    [
      navigateSidePanel,
      store,
      workspaceSurface.instanceId,
      workspaceSurface.type,
    ],
  );

  return {
    navigatePageLayoutSidePanel,
  };
};
