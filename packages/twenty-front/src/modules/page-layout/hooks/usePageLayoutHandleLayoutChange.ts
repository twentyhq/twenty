import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { type Layout, type Layouts } from 'react-grid-layout';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutCurrentLayoutsComponentState } from '../states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '../states/pageLayoutDraftComponentState';
import { convertLayoutsToWidgets } from '../utils/convertLayoutsToWidgets';

export const usePageLayoutHandleLayoutChange = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const activeTabIdState = useRecoilComponentCallbackState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const handleLayoutChange = useRecoilCallback(
    ({ snapshot, set }) =>
      (_: Layout[], allLayouts: Layouts) => {
        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();

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
                const tabWidgets = updatedWidgets
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
    [activeTabIdState, pageLayoutCurrentLayoutsState, pageLayoutDraftState],
  );

  return { handleLayoutChange };
};
