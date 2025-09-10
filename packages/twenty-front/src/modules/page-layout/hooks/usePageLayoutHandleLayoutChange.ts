import { type Layout, type Layouts } from 'react-grid-layout';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { type PageLayoutWidgetWithData } from '../types/pageLayoutTypes';
import { convertLayoutsToWidgets } from '../utils/convertLayoutsToWidgets';

export const usePageLayoutHandleLayoutChange = (activeTabId: string | null) => {
  const handleLayoutChange = useRecoilCallback(
    ({ snapshot, set }) =>
      (_: Layout[], allLayouts: Layouts) => {
        if (!isDefined(activeTabId)) return;
        const currentTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        set(pageLayoutCurrentLayoutsState, {
          ...currentTabLayouts,
          [activeTabId]: allLayouts,
        });

        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const currentTab = pageLayoutDraft.tabs.find(
          (tab) => tab.id === activeTabId,
        );
        if (!currentTab) return;
        const updatedWidgets = convertLayoutsToWidgets(
          currentTab.widgets,
          allLayouts,
        );

        if (isDefined(activeTabId)) {
          set(pageLayoutDraftState, (prev) => ({
            ...prev,
            tabs: prev.tabs.map((tab) => {
              if (tab.id === activeTabId) {
                const tabWidgets: PageLayoutWidgetWithData[] = updatedWidgets
                  .filter((w) => w.pageLayoutTabId === activeTabId)
                  .map((widget) => ({
                    id: widget.id,
                    pageLayoutTabId: widget.pageLayoutTabId || activeTabId,
                    title: widget.title,
                    type: widget.type,
                    objectMetadataId: null,
                    gridPosition: widget.gridPosition,
                    configuration: widget.configuration || undefined,
                    data: widget.data,
                    createdAt:
                      tab.widgets.find((w) => w.id === widget.id)?.createdAt ||
                      new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    deletedAt: null,
                  }));
                return {
                  ...tab,
                  widgets: tabWidgets,
                };
              }
              return tab;
            }),
          }));
        }
      },
    [activeTabId],
  );

  return { handleLayoutChange };
};
