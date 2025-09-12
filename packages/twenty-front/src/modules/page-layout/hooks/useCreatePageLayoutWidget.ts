import { type GraphType } from '@/page-layout/mocks/mockWidgets';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createUpdatedTabLayouts } from '@/page-layout/utils/createUpdatedTabLayouts';
import {
  getDefaultWidgetData,
  getWidgetSize,
  getWidgetTitle,
} from '@/page-layout/utils/getDefaultWidgetData';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { type WidgetType } from '~/generated/graphql';

export const useCreatePageLayoutWidget = (pageLayoutId: string) => {
  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutInstanceId,
  );

  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutInstanceId,
  );

  const createPageLayoutWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetType: WidgetType, graphType: GraphType) => {
        const widgetData = getDefaultWidgetData(graphType);

        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();
        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();
        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
          .getValue();

        if (!activeTabId) {
          return;
        }

        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const existingWidgetCount = allWidgets.filter(
          (w) =>
            w.type === widgetType && w.configuration.graphType === graphType,
        ).length;
        const title = getWidgetTitle(graphType, existingWidgetCount);
        const widgetId = `widget-${uuidv4()}`;

        const defaultSize = getWidgetSize(graphType);
        const position = getDefaultWidgetPosition(
          pageLayoutDraggedArea,
          defaultSize,
        );

        const newWidget: PageLayoutWidgetWithData = {
          id: widgetId,
          pageLayoutTabId: activeTabId,
          title,
          type: widgetType,
          gridPosition: {
            row: position.y,
            column: position.x,
            rowSpan: position.h,
            columnSpan: position.w,
          },
          configuration: {
            graphType,
          },
          data: widgetData as Record<string, unknown>,
          objectMetadataId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        const newLayout = {
          i: widgetId,
          x: position.x,
          y: position.y,
          w: position.w,
          h: position.h,
        };

        const updatedLayouts = createUpdatedTabLayouts(
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
      activeTabId,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
    ],
  );

  return { createPageLayoutWidget };
};
