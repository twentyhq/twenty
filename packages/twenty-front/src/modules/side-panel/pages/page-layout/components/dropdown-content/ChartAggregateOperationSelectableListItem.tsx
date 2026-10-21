import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { type AggregateChartOperation } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/types/AggregateChartOperation';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

const isExtendedAggregateOperation = (
  operation: AggregateChartOperation,
): operation is ExtendedAggregateOperations => {
  return operation !== DASHBOARD_AGGREGATE_OPERATION_RATIO;
};

type ChartAggregateOperationSelectableListItemProps = {
  operation: AggregateChartOperation;
  label: string;
  currentFieldMetadataId: string;
};

export const ChartAggregateOperationSelectableListItem = ({
  operation,
  label,
  currentFieldMetadataId,
}: ChartAggregateOperationSelectableListItemProps) => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const configuration = widgetInEditMode?.configuration;

  const currentAggregateOperation =
    isDefined(configuration) &&
    'aggregateOperation' in configuration &&
    configuration.aggregateOperation;

  const isCurrentlyRatio =
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration') &&
    isDefined(configuration.ratioAggregateConfig);

  if (!isExtendedAggregateOperation(operation)) {
    return null;
  }

  const aggregateOperation =
    convertExtendedAggregateOperationToAggregateOperation(operation);

  const isSelected =
    currentAggregateOperation === aggregateOperation && !isCurrentlyRatio;

  const handleClick = () => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        aggregateFieldMetadataId: currentFieldMetadataId,
        aggregateOperation,
        ratioAggregateConfig: null,
      },
    });
  };

  return (
    <Dropdown.OptionItem onSelect={handleClick} selected={isSelected}>
      {label}
    </Dropdown.OptionItem>
  );
};
