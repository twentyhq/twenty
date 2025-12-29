import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';
import { createDefaultGraphWidget } from '@/page-layout/utils/createDefaultGraphWidget';
import { getDefaultWidgetPosition } from '@/page-layout/utils/getDefaultWidgetPosition';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getUpdatedTabLayouts } from '@/page-layout/utils/getUpdatedTabLayouts';
import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';
import { getWidgetTitle } from '@/page-layout/utils/getWidgetTitle';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import {
  BarChartLayout,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated/graphql';

export const useCreatePageLayoutGraphWidget = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { timeZone, calendarStartDay } = useDateTimeFormat();

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const activeTabIdState = useRecoilComponentCallbackState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const createPageLayoutGraphWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        fieldSelection,
      }: {
        fieldSelection?: GraphWidgetFieldSelection;
      }): PageLayoutWidget => {
        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();

        if (!isDefined(activeTabId)) {
          throw new Error(
            'A tab must be selected to create a new graph widget',
          );
        }

        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const pageLayoutDraggedArea = snapshot
          .getLoadable(pageLayoutDraggedAreaState)
          .getValue();

        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const existingWidgetCount = allWidgets.filter((widget) => {
          if (widget.type !== WidgetType.GRAPH) {
            return false;
          }

          if (
            !isWidgetConfigurationOfType(
              widget.configuration,
              'BarChartConfiguration',
            )
          ) {
            return false;
          }
          return widget.configuration.layout === BarChartLayout.VERTICAL;
        }).length;

        const title = getWidgetTitle(
          {
            configurationType: WidgetConfigurationType.BAR_CHART,
            layout: BarChartLayout.VERTICAL,
          },
          existingWidgetCount,
        );
        const widgetId = uuidv4();

        const defaultSize = getWidgetSize(
          WidgetConfigurationType.BAR_CHART,
          'default',
        );
        const minimumSize = getWidgetSize(
          WidgetConfigurationType.BAR_CHART,
          'minimum',
        );
        const position = getDefaultWidgetPosition(
          pageLayoutDraggedArea,
          defaultSize,
          minimumSize,
        );

        const newWidget = createDefaultGraphWidget({
          id: widgetId,
          pageLayoutTabId: activeTabId,
          title,
          gridPosition: {
            row: position.y,
            column: position.x,
            rowSpan: position.h,
            columnSpan: position.w,
          },
          fieldSelection,
          timezone: timeZone,
          firstDayOfTheWeek: calendarStartDay,
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
      timeZone,
      calendarStartDay,
    ],
  );

  return { createPageLayoutGraphWidget };
};
