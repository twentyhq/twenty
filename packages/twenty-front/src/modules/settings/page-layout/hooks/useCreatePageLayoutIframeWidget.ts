import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { type Widget, WidgetType } from '../mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutCurrentTabIdForCreationState } from '../states/pageLayoutCurrentTabIdForCreation';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';
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

        const activeTabId = snapshot
          .getLoadable(pageLayoutCurrentTabIdForCreationState)
          .getValue();

        if (!activeTabId) {
          throw new Error('No active tab selected');
        }

        const newWidget: Widget = {
          id: `widget-${uuidv4()}`,
          type: WidgetType.IFRAME,
          title,
          pageLayoutTabId: activeTabId,
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

        const widgetWithPosition: PageLayoutWidget = {
          id: newWidget.id,
          pageLayoutTabId: activeTabId,
          title: newWidget.title,
          type: newWidget.type,
          gridPosition: {
            row: position.y,
            column: position.x,
            rowSpan: position.h,
            columnSpan: position.w,
          },
          configuration: newWidget.configuration as
            | Record<string, unknown>
            | undefined,
          objectMetadataId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        set(pageLayoutTabsState, (prevTabs) => {
          return prevTabs.map((tab) => {
            if (tab.id === activeTabId) {
              return {
                ...tab,
                widgets: [...tab.widgets, widgetWithPosition],
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
                widgets: [...tab.widgets, widgetWithPosition],
              };
            }
            return tab;
          }),
        }));

        set(pageLayoutDraggedAreaState, null);
      },
    [],
  );

  return { createPageLayoutIframeWidget };
};
