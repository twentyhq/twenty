import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { type AggregateChartOperation } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/types/AggregateChartOperation';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';

const isExtendedAggregateOperation = (
  operation: AggregateChartOperation,
): operation is ExtendedAggregateOperations => {
  return operation !== DASHBOARD_AGGREGATE_OPERATION_RATIO;
};

export const ChartAggregateOperationSelectableListItem = ({
  operation,
  label,
  currentFieldMetadataId,
}: {
  operation: AggregateChartOperation;
  label: string;
  currentFieldMetadataId: string;
}) => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const configuration = widgetInEditMode?.configuration;

  const currentAggregateOperation =
    configuration &&
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

  const isFocused = selectedItemId === operation;

  const handleClick = () => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        aggregateFieldMetadataId: currentFieldMetadataId,
        aggregateOperation,
        ratioAggregateConfig: null,
      },
    });
    closeDropdown();
  };

  return (
    <SelectableListItem itemId={operation} onEnter={handleClick}>
      <MenuItemSelect
        text={label}
        selected={isSelected}
        focused={isFocused}
        onClick={handleClick}
      />
    </SelectableListItem>
  );
};
