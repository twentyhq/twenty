import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

export const useNavigateToMoreWidgets = () => {
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const navigateToMoreWidgets = useCallback(() => {
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutWidgetTypeSelect,
    });
  }, [navigatePageLayoutSidePanel]);

  return { navigateToMoreWidgets };
};
