import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultIframeWidget } from '@/page-layout/utils/createDefaultIframeWidget';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '~/generated-metadata/graphql';

export const useCreatePageLayoutIframeWidget = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    getTabListInstanceIdFromPageLayoutId(pageLayoutId),
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const createPageLayoutIframeWidget = useCallback(
    (title: string, url: string | null): PageLayoutWidget => {
      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const pageLayoutDraggedArea = store.get(pageLayoutDraggedAreaState);

      if (!isDefined(activeTabId)) {
        throw new Error('A tab must be selected to create a new iframe widget');
      }

      const widgetId = uuidv4();
      const iframeSize = WIDGET_SIZES[WidgetType.IFRAME]!;
      const defaultIframeSize = iframeSize.default;
      const minimumSize = iframeSize.minimum;
      const position = getDefaultWidgetPosition(
        pageLayoutDraggedArea,
        defaultIframeSize,
        minimumSize,
      );

      const newWidget = createDefaultIframeWidget(
        widgetId,
        activeTabId,
        title,
        url,
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
        minW: minimumSize.w,
        minH: minimumSize.h,
      };

      const updatedLayouts = getUpdatedTabLayouts(
        allTabLayouts,
        activeTabId,
        newLayout,
      );

      store.set(pageLayoutCurrentLayoutsState, updatedLayouts);

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: addWidgetToTab(prev.tabs, activeTabId, newWidget),
      }));

      store.set(pageLayoutDraggedAreaState, null);

      return newWidget;
    },
    [
      activeTabId,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
      store,
    ],
  );

  return { createPageLayoutIframeWidget };
};
