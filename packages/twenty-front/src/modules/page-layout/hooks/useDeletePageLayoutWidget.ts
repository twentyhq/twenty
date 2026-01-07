import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';

export const useDeletePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const { closeCommandMenu } = useCommandMenu();

  const deletePageLayoutWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string) => {
        closeCommandMenu();

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
    [closeCommandMenu, pageLayoutCurrentLayoutsState, pageLayoutDraftState],
  );

  return { deletePageLayoutWidget };
};
