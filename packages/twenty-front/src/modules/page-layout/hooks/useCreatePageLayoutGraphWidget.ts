import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultGraphWidget } from '@/page-layout/utils/createDefaultGraphWidget';
import {
  getWidgetSize,
  getWidgetTitle,
} from '@/page-layout/utils/getDefaultWidgetData';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { type GraphType } from '~/generated-metadata/graphql';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { type WidgetType } from '~/generated/graphql';

export const useCreatePageLayoutGraphWidget = (
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

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const createPageLayoutWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetType: WidgetType, graphType: GraphType) => {
        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();

        if (!activeTabId) {
          return;
        }

        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
          .getValue();

        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const existingWidgetCount = allWidgets.filter(
          (w) =>
            w.type === widgetType &&
            w.configuration &&
            'graphType' in w.configuration &&
            w.configuration.graphType === graphType,
        ).length;
        const title = getWidgetTitle(graphType, existingWidgetCount);
        const widgetId = uuidv4();

        const defaultSize = getWidgetSize(graphType);
        const position = getDefaultWidgetPosition(
          pageLayoutDraggedArea,
          defaultSize,
        );

        const newWidget = createDefaultGraphWidget(
          widgetId,
          activeTabId,
          title,
          graphType,
          {
            row: position.y,
            column: position.x,
            rowSpan: position.h,
            columnSpan: position.w,
          },
        );

        const newLayout = {
          i: widgetId,
          x: position.x,
          y: position.y,
          w: position.w,
          h: position.h,
        };

        const updatedLayouts = getUpdatedTabLayouts(
          allTabLayouts,
          activeTabId,
          newLayout,
        );
        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: addWidgetToTab(prev.tabs, activeTabId, newWidget),
        }));

        set(pageLayoutDraggedAreaState, null);
      },
    [
      activeTabIdState,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
    ],
  );

  return { createPageLayoutWidget };
};
