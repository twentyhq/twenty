import { GRAPH_TYPE_TO_CONFIG_TYPENAME } from '@/command-menu/pages/page-layout/constants/GraphTypeToConfigTypename';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { convertAggregateOperationForDateField } from '@/command-menu/pages/page-layout/utils/convertAggregateOperationForDateField';
import { convertBarOrLineChartConfigToPieChart } from '@/command-menu/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { convertPieChartConfigToBarOrLineChart } from '@/command-menu/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
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
import { GraphType } from '~/generated/graphql';

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

        const currentConfiguration =
          widgetInDraft.configuration as ChartConfiguration;

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
        const isBarOrLineChart =
          graphType === GraphType.VERTICAL_BAR ||
          graphType === GraphType.HORIZONTAL_BAR ||
          graphType === GraphType.LINE;
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

        const activeTabId = snapshot.getLoadable(activeTabIdState).getValue();

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
      currentlyEditingWidgetIdState,
      objectMetadataItems,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      widget.objectMetadataId,
    ],
  );

  return { getConfigToUpdateAfterGraphTypeChange };
};
