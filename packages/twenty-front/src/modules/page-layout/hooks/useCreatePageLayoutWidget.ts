import { SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID } from '@/page-layout/constants/SettingsPageLayoutTabsInstanceId';
import { type GraphType } from '@/page-layout/mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '@/page-layout/states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '@/page-layout/states/pageLayoutDraftState';
import { pageLayoutDraggedAreaState } from '@/page-layout/states/pageLayoutDraggedAreaState';
import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createUpdatedTabLayouts } from '@/page-layout/utils/createUpdatedTabLayouts';
import {
  getDefaultWidgetData,
  getWidgetSize,
  getWidgetTitle,
} from '@/page-layout/utils/getDefaultWidgetData';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { type WidgetType } from '~/generated/graphql';

export const useCreatePageLayoutWidget = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_PAGE_LAYOUT_TABS_INSTANCE_ID,
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
    [activeTabId],
  );

  return { createPageLayoutWidget };
};
