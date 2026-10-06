import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { buildAutoDashboardFilterBindingsForNewWidget } from '@/page-layout/dashboard-filters/utils/buildAutoDashboardFilterBindingsForNewWidget';
import { useCreatePageLayoutWidget } from '@/page-layout/hooks/useCreatePageLayoutWidget';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { getWidgetTitle } from '@/page-layout/utils/getWidgetTitle';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  BarChartLayout,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const useCreatePageLayoutGraphWidget = ({
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

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();
  const { timeZone, calendarStartDay } = useDateTimeFormat();
  const { objectMetadataItems } = useObjectMetadataItems();

  const { createPageLayoutWidget } = useCreatePageLayoutWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const createPageLayoutGraphWidget = useCallback(
    ({
      fieldSelection,
    }: {
      fieldSelection?: GraphWidgetFieldSelection;
    }): PageLayoutWidget => {
      const pageLayoutDraft = store.get(pageLayoutDraftState);
      const existingWidgets = pageLayoutDraft.tabs.flatMap(
        (tab) => tab.widgets,
      );

      const existingVerticalBarChartCount = existingWidgets.filter(
        (widget) =>
          widget.type === WidgetType.GRAPH &&
          isWidgetConfigurationOfType(
            widget.configuration,
            'BarChartConfiguration',
          ) &&
          widget.configuration.layout === BarChartLayout.VERTICAL,
      ).length;

      return createPageLayoutWidget({
        type: WidgetType.GRAPH,
        title: getWidgetTitle(
          {
            configurationType: WidgetConfigurationType.BAR_CHART,
            layout: BarChartLayout.VERTICAL,
          },
          existingVerticalBarChartCount,
        ),
        configuration: {
          ...buildDefaultBarChartConfiguration({
            fieldSelection,
            timezone: timeZone,
            firstDayOfTheWeek: calendarStartDay,
          }),
          // Custom slots follow the chart from creation; built-ins need no binding since they resolve by field.
          ...(isDefined(pageLayoutDraft.dashboardFilters) &&
          pageLayoutDraft.dashboardFilters.length > 0
            ? {
                dashboardFilterBindings:
                  buildAutoDashboardFilterBindingsForNewWidget({
                    slots: pageLayoutDraft.dashboardFilters,
                    widgetObjectMetadataId: fieldSelection?.objectMetadataId,
                    existingWidgets,
                    objectMetadataItems,
                  }),
              }
            : {}),
        },
        objectMetadataId: fieldSelection?.objectMetadataId,
      });
    },
    [
      calendarStartDay,
      createPageLayoutWidget,
      objectMetadataItems,
      pageLayoutDraftState,
      store,
      timeZone,
    ],
  );

  return { createPageLayoutGraphWidget };
};
