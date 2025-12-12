import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { type AggregateChartOperation } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/types/AggregateChartOperation';
import { t } from '@lingui/core/macro';

export const getAggregateChartOperationLabel = (
  operation: AggregateChartOperation,
) => {
  if (operation === DASHBOARD_AGGREGATE_OPERATION_RATIO) {
    return t`Ratio`;
  }

  return getAggregateOperationLabel(operation);
};
