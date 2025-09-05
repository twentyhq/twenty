import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { type GraphSubType, type WidgetType } from '../mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutCurrentTabIdForCreationState } from '../states/pageLayoutCurrentTabIdForCreation';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';
import {
  getDefaultWidgetData,
  getWidgetSize,
  getWidgetTitle,
} from '../utils/getDefaultWidgetData';
import { getDefaultWidgetPosition } from '../utils/getDefaultWidgetPosition';

export const usePageLayoutWidgetCreate = () => {
  const handleCreateWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetType: WidgetType, graphType: GraphSubType) => {
        const widgetData = getDefaultWidgetData(graphType);

        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();
        const pageLayoutCurrentLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();
        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
          .getValue();
        const activeTabId = snapshot
          .getLoadable(pageLayoutCurrentTabIdForCreationState)
          .getValue();

        if (!activeTabId) {
          return;
        }

        const existingWidgetCount = pageLayoutWidgets.filter(
          (w) =>
            w.type === widgetType && w.configuration?.graphType === graphType,
        ).length;
        const title = getWidgetTitle(graphType, existingWidgetCount);
        const widgetId = `widget-${uuidv4()}`;

        const defaultSize = getWidgetSize(graphType);
        const position = getDefaultWidgetPosition(
          pageLayoutDraggedArea,
          defaultSize,
        );

        const newWidget: PageLayoutWidget = {
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
          data: widgetData,
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

        const updatedWidgets = [...pageLayoutWidgets, newWidget];
        set(pageLayoutWidgetsState, updatedWidgets);

        const updatedLayouts = {
          desktop: [...(pageLayoutCurrentLayouts.desktop || []), newLayout],
          mobile: [
            ...(pageLayoutCurrentLayouts.mobile || []),
            { ...newLayout, w: 1, x: 0 },
          ],
        };
        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutTabsState, (prevTabs) => {
          return prevTabs.map((tab) => {
            if (tab.id === activeTabId) {
              return {
                ...tab,
                widgets: [...tab.widgets, newWidget],
              };
            }
            return tab;
          });
        });

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) => {
            if (tab.id === activeTabId) {
              return {
                ...tab,
                widgets: [...tab.widgets, newWidget],
              };
            }
            return tab;
          }),
        }));

        set(pageLayoutDraggedAreaState, null);
      },
    [],
  );

  return { handleCreateWidget };
};
