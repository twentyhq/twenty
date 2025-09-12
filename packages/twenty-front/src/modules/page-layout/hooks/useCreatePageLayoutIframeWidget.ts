import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createUpdatedTabLayouts } from '@/page-layout/utils/createUpdatedTabLayouts';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '~/generated/graphql';

export const useCreatePageLayoutIframeWidget = (pageLayoutId: string) => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    getTabListInstanceIdFromPageLayoutId(pageLayoutId),
  );

  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutInstanceId,
  );
  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutInstanceId,
  );
  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutInstanceId,
  );
  const createPageLayoutIframeWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (title: string, url: string) => {
        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();
        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
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

        const newWidget: PageLayoutWidgetWithData = {
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
          data: {},
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

  return { createPageLayoutIframeWidget };
};
