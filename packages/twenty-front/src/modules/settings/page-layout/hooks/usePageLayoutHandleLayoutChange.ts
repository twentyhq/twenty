import { type Layout, type Layouts } from 'react-grid-layout';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';
import { convertLayoutsToWidgets } from '../utils/convertLayoutsToWidgets';

export const usePageLayoutHandleLayoutChange = (activeTabId: string | null) => {
  const handleLayoutChange = useRecoilCallback(
    ({ snapshot, set }) =>
      (_: Layout[], allLayouts: Layouts) => {
        set(pageLayoutCurrentLayoutsState, allLayouts);

        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();

        const updatedWidgets = convertLayoutsToWidgets(
          pageLayoutWidgets,
          allLayouts,
        );

        if (isDefined(activeTabId)) {
          set(pageLayoutTabsState, (prevTabs) => {
            return prevTabs.map((tab) => {
              if (tab.id === activeTabId) {
                const tabWidgets: PageLayoutWidget[] = updatedWidgets
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
            });
          });
        }

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          widgets: updatedWidgets,
        }));
      },
    [activeTabId],
  );

  return { handleLayoutChange };
};
