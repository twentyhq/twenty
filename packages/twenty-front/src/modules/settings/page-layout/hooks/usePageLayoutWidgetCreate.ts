import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { type GraphSubType, type Widget } from '../mocks/mockWidgets';
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
  const [pageLayoutWidgets, setPageLayoutWidgets] = useRecoilState(
    pageLayoutWidgetsState,
  );
  const [pageLayoutCurrentLayouts, setPageLayoutCurrentLayouts] =
    useRecoilState(pageLayoutCurrentLayoutsState);
  const [pageLayoutDraggedArea, setPageLayoutDraggedArea] = useRecoilState(
    pageLayoutDraggedAreaState,
  );
  const setPageLayoutDraft = useSetRecoilState(pageLayoutDraftState);

  const handleCreateWidget = useCallback(
    (widgetType: 'GRAPH', graphType: GraphSubType) => {
      const widgetData = getDefaultWidgetData(graphType);

      const existingWidgetCount = pageLayoutWidgets.filter(
        (w) => w.type === widgetType && w.graphType === graphType,
      ).length;
      const title = getWidgetTitle(graphType, existingWidgetCount);

      const newWidget: Widget = {
        id: `widget-${uuidv4()}`,
        type: widgetType,
        graphType,
        title,
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
      setPageLayoutWidgets(updatedWidgets);

      const updatedLayouts = {
        desktop: [...(pageLayoutCurrentLayouts.desktop || []), newLayout],
        mobile: [
          ...(pageLayoutCurrentLayouts.mobile || []),
          { ...newLayout, w: 1, x: 0 },
        ],
      };
      setPageLayoutCurrentLayouts(updatedLayouts);

      const widgetWithPosition = {
        ...newWidget,
        gridPosition: {
          row: position.y,
          column: position.x,
          rowSpan: position.h,
          columnSpan: position.w,
        },
      };

      setPageLayoutDraft((prev) => ({
        ...prev,
        widgets: [...prev.widgets, widgetWithPosition],
      }));

      setPageLayoutDraggedArea(null);
    },
    [
      pageLayoutWidgets,
      pageLayoutDraggedArea,
      pageLayoutCurrentLayouts,
      setPageLayoutWidgets,
      setPageLayoutCurrentLayouts,
      setPageLayoutDraggedArea,
      setPageLayoutDraft,
    ],
  );

  return { handleCreateWidget };
};
