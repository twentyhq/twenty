import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultFrontComponentWidget } from '@/page-layout/utils/createDefaultFrontComponentWidget';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '~/generated-metadata/graphql';

export const useCreatePageLayoutFrontComponentWidget = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    getTabListInstanceIdFromPageLayoutId(pageLayoutId),
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useAtomComponentStateCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const createPageLayoutFrontComponentWidget = useCallback(
    (title: string, frontComponentId: string): PageLayoutWidget => {
      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const pageLayoutDraggedArea = store.get(pageLayoutDraggedAreaState);

      if (!isDefined(activeTabId)) {
        throw new Error(
          'A tab must be selected to create a new front component widget',
        );
      }

      const widgetId = uuidv4();
      const frontComponentSize = WIDGET_SIZES[WidgetType.FRONT_COMPONENT]!;
      const defaultSize = frontComponentSize.default;
      const minimumSize = frontComponentSize.minimum;
      const position = getDefaultWidgetPosition(
        pageLayoutDraggedArea,
        defaultSize,
        minimumSize,
      );

      const newWidget = createDefaultFrontComponentWidget(
        widgetId,
        activeTabId,
        title,
        frontComponentId,
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

  return { createPageLayoutFrontComponentWidget };
};
