import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import {
  type PageLayoutWidget,
  type RichTextV2Body,
  WidgetType,
} from '~/generated/graphql';

export const useCreatePageLayoutStandaloneRichTextWidget = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const activeTabIdState = useRecoilComponentCallbackState(
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

  const createPageLayoutStandaloneRichTextWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (body: RichTextV2Body): PageLayoutWidget => {
        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();

        if (!isDefined(activeTabId)) {
          throw new Error(
            'A tab must be selected to create a new rich text widget',
          );
        }

        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
          .getValue();

        const widgetId = uuidv4();
        const richTextSize = WIDGET_SIZES[WidgetType.STANDALONE_RICH_TEXT]!;
        const defaultRichTextSize = richTextSize.default;
        const minimumSize = richTextSize.minimum;
        const position = getDefaultWidgetPosition(
          pageLayoutDraggedArea,
          defaultRichTextSize,
          minimumSize,
        );

        const newWidget = createDefaultStandaloneRichTextWidget(
          widgetId,
          activeTabId,

          body,
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
      activeTabIdState,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
    ],
  );

  return { createPageLayoutStandaloneRichTextWidget };
};
