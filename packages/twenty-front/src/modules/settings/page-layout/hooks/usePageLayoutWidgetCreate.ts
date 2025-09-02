import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import {
  type GraphSubType,
  type Widget,
  type WidgetType,
} from '../mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
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

        const existingWidgetCount = pageLayoutWidgets.filter(
          (w) =>
            w.type === widgetType && w.configuration?.graphType === graphType,
        ).length;
        const title = getWidgetTitle(graphType, existingWidgetCount);

        const newWidget: Widget = {
          id: `widget-${uuidv4()}`,
          type: widgetType,
          title,
          configuration: {
            graphType,
          },
          data: widgetData,
        };

        const defaultSize = getWidgetSize(graphType);
        const position = getDefaultWidgetPosition(
          pageLayoutDraggedArea,
          defaultSize,
        );

        const newLayout = {
          i: newWidget.id,
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

        const widgetWithPosition = {
          ...newWidget,
          gridPosition: {
            row: position.y,
            column: position.x,
            rowSpan: position.h,
            columnSpan: position.w,
          },
        };

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          widgets: [...prev.widgets, widgetWithPosition],
        }));

        set(pageLayoutDraggedAreaState, null);
      },
    [],
  );

  return { handleCreateWidget };
};
