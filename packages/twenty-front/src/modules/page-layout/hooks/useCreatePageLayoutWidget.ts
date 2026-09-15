import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import {
  PageLayoutTabLayoutMode,
  type WidgetType,
} from '~/generated-metadata/graphql';

type CreatePageLayoutWidgetParams = {
  type: WidgetType;
  title: string;
  configuration: PageLayoutWidget['configuration'];
  objectMetadataId?: string | null;
};

export const useCreatePageLayoutWidget = ({
  pageLayoutId: pageLayoutIdFromProps,
  tabListInstanceId,
}: {
  pageLayoutId: string;
  tabListInstanceId: string;
}) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
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

  const createPageLayoutWidget = useCallback(
    ({
      type,
      title,
      configuration,
      objectMetadataId,
    }: CreatePageLayoutWidgetParams): PageLayoutWidget => {
      const activeTabId = store.get(
        activeTabIdComponentState.atomFamily({
          instanceId: tabListInstanceId,
        }),
      );

      if (!isDefined(activeTabId)) {
        throw new Error(
          `A tab must be selected to create a new ${type} widget`,
        );
      }

      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);
      const pageLayoutDraggedArea = store.get(pageLayoutDraggedAreaState);

      const widgetSizeConfig = WIDGET_SIZES[type] ?? {
        default: getWidgetSize(configuration.configurationType, 'default'),
        minimum: getWidgetSize(configuration.configurationType, 'minimum'),
      };
      const minimumSize = widgetSizeConfig.minimum;
      const position = getDefaultWidgetPosition(
        pageLayoutDraggedArea,
        widgetSizeConfig.default,
        minimumSize,
      );

      const widgetId = uuidv4();

      const newWidget = buildDraftPageLayoutWidget({
        id: widgetId,
        pageLayoutTabId: activeTabId,
        title,
        type,
        configuration,
        position: {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: position.y,
          column: position.x,
          rowSpan: position.h,
          columnSpan: position.w,
        },
        objectMetadataId,
      });

      const newLayout = {
        i: widgetId,
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        minW: minimumSize.w,
        minH: minimumSize.h,
      };

      store.set(
        pageLayoutCurrentLayoutsState,
        getUpdatedTabLayouts(allTabLayouts, activeTabId, newLayout),
      );

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: addWidgetToTab(prev.tabs, activeTabId, newWidget),
      }));

      store.set(pageLayoutDraggedAreaState, null);

      return newWidget;
    },
    [
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
      store,
      tabListInstanceId,
    ],
  );

  return { createPageLayoutWidget };
};
