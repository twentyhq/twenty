import { pageLayoutEditingDashboardFilterSlotIdComponentState } from '@/page-layout/states/pageLayoutEditingDashboardFilterSlotIdComponentState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { getPageLayoutIcon } from '@/side-panel/pages/page-layout/utils/getPageLayoutIcon';
import { getPageLayoutPageTitle } from '@/side-panel/pages/page-layout/utils/getPageLayoutPageTitle';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type DashboardFilterSlot, SidePanelPages } from 'twenty-shared/types';
import { v4 } from 'uuid';

export const useOpenDashboardFilterEditor = (pageLayoutId: string) => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const setPageLayoutEditingDashboardFilterSlotId = useSetAtomComponentState(
    pageLayoutEditingDashboardFilterSlotIdComponentState,
    pageLayoutId,
  );

  // Navigating first: opening over a closing panel runs the close cleanup, which resets the editing slot id.
  const openDashboardFiltersEditor = useCallback(() => {
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutDashboardFilters,
      resetNavigationStack: true,
    });
    setPageLayoutEditingDashboardFilterSlotId(null);
  }, [navigatePageLayoutSidePanel, setPageLayoutEditingDashboardFilterSlotId]);

  // The sub-page stack is scoped to a page instance that only exists once the page mounts,
  // so the page id is chosen here and its stack seeded with the detail entry.
  const openDashboardFilterSlotEditor = useCallback(
    (slot: DashboardFilterSlot) => {
      const pageId = v4();

      navigateSidePanel({
        page: SidePanelPages.PageLayoutDashboardFilters,
        pageTitle: getPageLayoutPageTitle(
          SidePanelPages.PageLayoutDashboardFilters,
        ),
        pageIcon: getPageLayoutIcon(SidePanelPages.PageLayoutDashboardFilters),
        pageId,
        resetNavigationStack: true,
      });
      store.set(
        sidePanelSubPageStackComponentState.atomFamily({ instanceId: pageId }),
        [
          {
            id: v4(),
            subPage: SidePanelSubPages.PageLayoutDashboardFilterDetail,
            title: slot.label,
          },
        ],
      );
      setPageLayoutEditingDashboardFilterSlotId(slot.id);
    },
    [navigateSidePanel, setPageLayoutEditingDashboardFilterSlotId, store],
  );

  return { openDashboardFiltersEditor, openDashboardFilterSlotEditor };
};
