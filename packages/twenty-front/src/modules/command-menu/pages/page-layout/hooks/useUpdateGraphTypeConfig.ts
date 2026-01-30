import { GRAPH_CONFIGURATION_TYPE_TO_CONFIG_TYPENAME } from '@/command-menu/pages/page-layout/constants/GraphConfigurationTypeToConfigTypename';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { GraphType } from '@/command-menu/pages/page-layout/types/GraphType';
import { convertAggregateOperationForDateField } from '@/command-menu/pages/page-layout/utils/convertAggregateOperationForDateField';
import { convertBarOrLineChartConfigToPieChart } from '@/command-menu/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { convertPieChartConfigToBarOrLineChart } from '@/command-menu/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { getConfigurationTypeFromGraphType } from '@/command-menu/pages/page-layout/utils/getConfigurationTypeFromGraphType';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isWidgetConfigurationOfTypeGraph } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { updateWidgetMinimumSizeForGraphType } from '@/page-layout/utils/updateWidgetMinimumSizeForGraphType';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

export const useGetConfigToUpdateAfterGraphTypeChange = ({
  pageLayoutId,
  widget,
}: {
  pageLayoutId: string;
  widget: PageLayoutWidget;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(pageLayoutId);

  const activeTabIdState = useRecoilComponentCallbackState(
    activeTabIdComponentState,
    tabListInstanceId,
  );

  const currentlyEditingWidgetIdState = useRecoilComponentCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const getConfigToUpdateAfterGraphTypeChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (graphType: GraphType) => {
        const currentlyEditingWidgetId = snapshot
          .getLoadable(currentlyEditingWidgetIdState)
          .getValue();

        if (!isDefined(currentlyEditingWidgetId)) {
          throw new Error('No widget is currently being edited');
        }

        const draftPageLayout = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const widgetInDraft = draftPageLayout.tabs
          .flatMap((tab) => tab.widgets)
          .find((w) => w.id === currentlyEditingWidgetId);

        if (
          !isDefined(widgetInDraft) ||
          !isDefined(widgetInDraft.configuration)
        ) {
          throw new Error('Widget configuration not found in draft state');
        }

        const currentConfiguration = widgetInDraft.configuration;

        if (!isWidgetConfigurationOfTypeGraph(currentConfiguration)) {
          throw new Error('Widget configuration is not a chart configuration');
        }

        const newConfigurationType =
          getConfigurationTypeFromGraphType(graphType);

        let configToUpdate = {
          __typename:
            GRAPH_CONFIGURATION_TYPE_TO_CONFIG_TYPENAME[newConfigurationType],
          configurationType: newConfigurationType,
        } as Partial<ChartConfiguration>;

        if (
          graphType !== GraphType.AGGREGATE &&
          graphType !== GraphType.GAUGE
        ) {
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === widget.objectMetadataId,
          );

          const convertedAggregateOperation =
            convertAggregateOperationForDateField(
              currentConfiguration,
              objectMetadataItem,
            );

          if (isDefined(convertedAggregateOperation)) {
            configToUpdate = {
              ...configToUpdate,
              aggregateOperation: convertedAggregateOperation,
            };
          }
        }

        const isPieChart = graphType === GraphType.PIE;
        const isVerticalBarChart = graphType === GraphType.VERTICAL_BAR;
        const isHorizontalBarChart = graphType === GraphType.HORIZONTAL_BAR;
        const isLineChart = graphType === GraphType.LINE;
        const isBarOrLineChart =
          isVerticalBarChart || isHorizontalBarChart || isLineChart;

        const wasBarOrLineChart =
          isWidgetConfigurationOfType(
            currentConfiguration,
            'BarChartConfiguration',
          ) ||
          isWidgetConfigurationOfType(
            currentConfiguration,
            'LineChartConfiguration',
          );

        const wasPieChart = isWidgetConfigurationOfType(
          currentConfiguration,
          'PieChartConfiguration',
        );

        if (isPieChart && wasBarOrLineChart) {
          configToUpdate = {
            ...configToUpdate,
            ...convertBarOrLineChartConfigToPieChart(currentConfiguration),
          };
        }

        if (isBarOrLineChart && wasPieChart) {
          configToUpdate = {
            ...configToUpdate,
            ...convertPieChartConfigToBarOrLineChart(currentConfiguration),
          };
        }

        if (isHorizontalBarChart) {
          configToUpdate = {
            ...configToUpdate,
            layout: BarChartLayout.HORIZONTAL,
          };
        }

        if (isVerticalBarChart) {
          configToUpdate = {
            ...configToUpdate,
            layout: BarChartLayout.VERTICAL,
          };
        }

        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();

        if (isDefined(activeTabId) && isDefined(currentlyEditingWidgetId)) {
          const currentLayouts = snapshot
            .getLoadable(pageLayoutCurrentLayoutsState)
            .getValue();

          const updatedLayouts = updateWidgetMinimumSizeForGraphType({
            configurationType: newConfigurationType,
            widgetId: currentlyEditingWidgetId,
            tabId: activeTabId,
            currentLayouts,
          });

          set(pageLayoutCurrentLayoutsState, updatedLayouts);
        }

        return configToUpdate;
      },
    [
      activeTabIdState,
      currentlyEditingWidgetIdState,
      objectMetadataItems,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      widget.objectMetadataId,
    ],
  );

  return { getConfigToUpdateAfterGraphTypeChange };
};
