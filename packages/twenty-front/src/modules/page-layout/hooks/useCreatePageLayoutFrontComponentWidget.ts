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
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';
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

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    getTabListInstanceIdFromPageLayoutId(pageLayoutId),
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const createPageLayoutFrontComponentWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (title: string, frontComponentId: string): PageLayoutWidget => {
        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
          .getValue();

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

        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: addWidgetToTab(prev.tabs, activeTabId, newWidget),
        }));

        set(pageLayoutDraggedAreaState, null);

        return newWidget;
      },
    [
      activeTabId,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
    ],
  );

  return { createPageLayoutFrontComponentWidget };
};
