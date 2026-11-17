import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useCreatePageLayoutWidget } from '@/page-layout/hooks/useCreatePageLayoutWidget';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { getWidgetTitle } from '@/page-layout/utils/getWidgetTitle';
import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { getChartConfigurationUpdateForGraphType } from '@/side-panel/pages/page-layout/utils/getChartConfigurationUpdateForGraphType';
import { getConfigurationTypeFromGraphType } from '@/side-panel/pages/page-layout/utils/getConfigurationTypeFromGraphType';
import { getCurrentGraphTypeFromConfig } from '@/side-panel/pages/page-layout/utils/getCurrentGraphTypeFromConfig';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { BarChartLayout, WidgetType } from '~/generated-metadata/graphql';

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

  const { createPageLayoutWidget } = useCreatePageLayoutWidget({
    pageLayoutId,
    tabListInstanceId,
  });

  const createPageLayoutGraphWidget = useCallback(
    ({
      fieldSelection,
      graphType = GraphType.VERTICAL_BAR,
    }: {
      fieldSelection?: GraphWidgetFieldSelection;
      graphType?: GraphType;
    }): PageLayoutWidget => {
      const existingChartOfSameTypeCount = store
        .get(pageLayoutDraftState)
        .tabs.flatMap((tab) => tab.widgets)
        .filter(
          (widget) =>
            widget.type === WidgetType.GRAPH &&
            isWidgetConfigurationOfTypeGraph(widget.configuration) &&
            getCurrentGraphTypeFromConfig(widget.configuration) === graphType,
        ).length;

      const barChartConfiguration = buildDefaultBarChartConfiguration({
        fieldSelection,
        timezone: timeZone,
        firstDayOfTheWeek: calendarStartDay,
      });

      return createPageLayoutWidget({
        type: WidgetType.GRAPH,
        title: getWidgetTitle(
          {
            configurationType: getConfigurationTypeFromGraphType(graphType),
            layout:
              graphType === GraphType.HORIZONTAL_BAR
                ? BarChartLayout.HORIZONTAL
                : BarChartLayout.VERTICAL,
          },
          existingChartOfSameTypeCount,
        ),
        configuration: {
          ...barChartConfiguration,
          ...getChartConfigurationUpdateForGraphType({
            currentConfiguration: barChartConfiguration,
            graphType,
          }),
        } as PageLayoutWidget['configuration'],
        objectMetadataId: fieldSelection?.objectMetadataId,
      });
    },
    [
      calendarStartDay,
      createPageLayoutWidget,
      pageLayoutDraftState,
      store,
      timeZone,
    ],
  );

  return { createPageLayoutGraphWidget };
};
