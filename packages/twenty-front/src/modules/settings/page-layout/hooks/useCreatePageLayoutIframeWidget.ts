import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '../mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutCurrentTabIdForCreationState } from '../states/pageLayoutCurrentTabIdForCreation';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';
import { addWidgetToTab } from '../utils/addWidgetToTab';
import { createUpdatedTabLayouts } from '../utils/createUpdatedTabLayouts';
import { getDefaultWidgetPosition } from '../utils/getDefaultWidgetPosition';

export const useCreatePageLayoutIframeWidget = () => {
  const createPageLayoutIframeWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (title: string, url: string) => {
        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();
        const allTabLayouts = snapshot
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

        const widgetId = `widget-${uuidv4()}`;
        const defaultSize = { w: 6, h: 6 };
        const position = getDefaultWidgetPosition(
          pageLayoutDraggedArea,
          defaultSize,
        );

        const newWidget: PageLayoutWidget = {
          id: widgetId,
          pageLayoutTabId: activeTabId,
          title,
          type: WidgetType.IFRAME,
          gridPosition: {
            row: position.y,
            column: position.x,
            rowSpan: position.h,
            columnSpan: position.w,
          },
          configuration: {
            url,
          },
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

        const updatedLayouts = createUpdatedTabLayouts(
          allTabLayouts,
          activeTabId,
          newLayout,
        );
        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutTabsState, (prevTabs) =>
          addWidgetToTab(prevTabs, activeTabId, newWidget),
        );

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: addWidgetToTab(prev.tabs, activeTabId, newWidget),
        }));

        set(pageLayoutDraggedAreaState, null);
      },
    [],
  );

  return { createPageLayoutIframeWidget };
};
