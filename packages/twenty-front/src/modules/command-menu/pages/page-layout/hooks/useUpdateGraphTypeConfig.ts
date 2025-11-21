import { GRAPH_TYPE_TO_CONFIG_TYPENAME } from '@/command-menu/pages/page-layout/constants/GraphTypeToConfigTypename';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { convertAggregateOperationForDateField } from '@/command-menu/pages/page-layout/utils/convertAggregateOperationForDateField';
import { convertBarOrLineChartConfigToPieChart } from '@/command-menu/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { convertPieChartConfigToBarOrLineChart } from '@/command-menu/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { updateWidgetMinimumSizeForGraphType } from '@/page-layout/utils/updateWidgetMinimumSizeForGraphType';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { GraphType, type PageLayoutWidget } from '~/generated/graphql';

export const useUpdateGraphTypeConfig = ({
  pageLayoutId,
  widget,
  configuration,
}: {
  pageLayoutId: string;
  widget: PageLayoutWidget;
  configuration: ChartConfiguration;
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

  const updateGraphTypeConfig = useRecoilCallback(
    ({ set, snapshot }) =>
      (graphType: GraphType) => {
        let configToUpdate: Record<string, any> = {
          __typename: GRAPH_TYPE_TO_CONFIG_TYPENAME[graphType],
          graphType,
        };

        if (
          graphType !== GraphType.AGGREGATE &&
          graphType !== GraphType.GAUGE
        ) {
          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === widget.objectMetadataId,
          );

          const convertedAggregateOperation =
            convertAggregateOperationForDateField(
              configuration,
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
        const isBarOrLineChart =
          graphType === GraphType.VERTICAL_BAR ||
          graphType === GraphType.HORIZONTAL_BAR ||
          graphType === GraphType.LINE;
        const wasBarOrLineChart =
          configuration.__typename === 'BarChartConfiguration' ||
          configuration.__typename === 'LineChartConfiguration';
        const wasPieChart =
          configuration.__typename === 'PieChartConfiguration';

        if (isPieChart && wasBarOrLineChart) {
          configToUpdate = {
            ...configToUpdate,
            ...convertBarOrLineChartConfigToPieChart(configuration),
          };
        }

        if (isBarOrLineChart && wasPieChart) {
          configToUpdate = {
            ...configToUpdate,
            ...convertPieChartConfigToBarOrLineChart(configuration),
          };
        }

        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();
        const currentlyEditingWidgetId = snapshot
          .getLoadable(currentlyEditingWidgetIdState)
          .getValue();

        if (isDefined(activeTabId) && isDefined(currentlyEditingWidgetId)) {
          const currentLayouts = snapshot
            .getLoadable(pageLayoutCurrentLayoutsState)
            .getValue();

          const updatedLayouts = updateWidgetMinimumSizeForGraphType(
            graphType,
            currentlyEditingWidgetId,
            activeTabId,
            currentLayouts,
          );

          set(pageLayoutCurrentLayoutsState, updatedLayouts);
        }

        return configToUpdate;
      },
    [
      activeTabIdState,
      configuration,
      currentlyEditingWidgetIdState,
      objectMetadataItems,
      pageLayoutCurrentLayoutsState,
      widget.objectMetadataId,
    ],
  );

  return { updateGraphTypeConfig };
};
