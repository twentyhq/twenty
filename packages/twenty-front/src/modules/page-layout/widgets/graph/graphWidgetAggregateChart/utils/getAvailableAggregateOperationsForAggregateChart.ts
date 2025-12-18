import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { type AggregateChartOperation } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/types/AggregateChartOperation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getAvailableAggregateOperationsForAggregateChart = ({
  fieldMetadataType,
}: {
  fieldMetadataType?: FieldMetadataType;
}): AggregateChartOperation[] => {
  const baseOperations = getAvailableAggregateOperationsForFieldMetadataType({
    fieldMetadataType,
  });

  const isSelectOrBoolean =
    fieldMetadataType === FieldMetadataType.SELECT ||
    fieldMetadataType === FieldMetadataType.MULTI_SELECT ||
    fieldMetadataType === FieldMetadataType.BOOLEAN;

  if (isSelectOrBoolean) {
    return [...baseOperations, DASHBOARD_AGGREGATE_OPERATION_RATIO];
  }

  return baseOperations;
};
