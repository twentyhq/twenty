import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { removeWidgetFromTab } from '../utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '../utils/removeWidgetLayoutFromTab';

export const useDeletePageLayoutWidget = () => {
  const deletePageLayoutWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string) => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();
        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const tabWithWidget = pageLayoutDraft.tabs.find((tab) =>
          tab.widgets.some((w) => w.id === widgetId),
        );
        const tabId = tabWithWidget?.id;

        if (isDefined(tabId)) {
          const updatedLayouts = removeWidgetLayoutFromTab(
            allTabLayouts,
            tabId,
            widgetId,
          );
          set(pageLayoutCurrentLayoutsState, updatedLayouts);

          set(pageLayoutDraftState, (prev) => ({
            ...prev,
            tabs: removeWidgetFromTab(prev.tabs, tabId, widgetId),
          }));
        }
      },
    [],
  );

  return { deletePageLayoutWidget };
};
