import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { type Widget, WidgetType } from '../mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { getDefaultWidgetPosition } from '../utils/getDefaultWidgetPosition';

export const useCreatePageLayoutIframeWidget = () => {
  const createPageLayoutIframeWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (title: string, url: string) => {
        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();
        const pageLayoutCurrentLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();
        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
          .getValue();

        const newWidget: Widget = {
          id: `widget-${uuidv4()}`,
          type: WidgetType.IFRAME,
          title,
          configuration: {
            url,
          },
        };

        const defaultSize = { w: 6, h: 6 };
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

  return { createPageLayoutIframeWidget };
};
