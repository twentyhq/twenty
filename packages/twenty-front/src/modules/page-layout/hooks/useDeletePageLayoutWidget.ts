import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsComponentState } from '../states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '../states/pageLayoutDraftComponentState';
import { removeWidgetFromTab } from '../utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '../utils/removeWidgetLayoutFromTab';

export const useDeletePageLayoutWidget = (pageLayoutId: string) => {
  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutInstanceId,
  );

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
    [pageLayoutCurrentLayoutsState, pageLayoutDraftState],
  );

  return { deletePageLayoutWidget };
};
