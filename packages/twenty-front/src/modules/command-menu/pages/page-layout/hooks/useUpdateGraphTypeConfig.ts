import { GRAPH_TYPE_TO_CONFIG_TYPENAME } from '@/command-menu/pages/page-layout/constants/GraphTypeToConfigTypename';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { updateWidgetMinimumSizeForGraphType } from '@/page-layout/utils/updateWidgetMinimumSizeForGraphType';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
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
        const configToUpdate: Record<string, any> = {
          __typename: GRAPH_TYPE_TO_CONFIG_TYPENAME[graphType],
          graphType,
        };

        if (
          graphType !== GraphType.AGGREGATE &&
          graphType !== GraphType.GAUGE
        ) {
          const currentAggregateFieldMetadataId =
            configuration.aggregateFieldMetadataId;

          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === widget.objectMetadataId,
          );

          if (isDefined(objectMetadataItem)) {
            const aggregateField = objectMetadataItem.fields.find(
              (field) => field.id === currentAggregateFieldMetadataId,
            );

            if (
              isDefined(aggregateField) &&
              isFieldMetadataDateKind(aggregateField.type) &&
              (configuration.aggregateOperation === AggregateOperations.MIN ||
                configuration.aggregateOperation === AggregateOperations.MAX)
            ) {
              configToUpdate.aggregateOperation = AggregateOperations.COUNT;
            }
          }
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
