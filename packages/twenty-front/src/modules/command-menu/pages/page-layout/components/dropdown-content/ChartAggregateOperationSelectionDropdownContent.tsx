import { ChartAggregateOperationSelectableListItem } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartAggregateOperationSelectableListItem';
import { ChartRatioAggregateOperationSelectableListItem } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartRatioAggregateOperationSelectableListItem';
import { ChartRatioOptionValueSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartRatioOptionValueSelectionDropdownContent';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { type AggregateChartOperation } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/types/AggregateChartOperation';
import { getAggregateChartOperationLabel } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/getAggregateChartOperationLabel';
import { getAvailableAggregateOperationsForAggregateChart } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/getAvailableAggregateOperationsForAggregateChart';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const ChartAggregateOperationSelectionDropdownContent = ({
  currentFieldMetadataId,
  setIsSubMenuOpen,
}: {
  currentFieldMetadataId: string;
  setIsSubMenuOpen: (isSubMenuOpen: boolean) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOptionValueMenuOpen, setIsOptionValueMenuOpen] = useState(false);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  const isAggregateChart = isWidgetConfigurationOfType(
    configuration,
    'AggregateChartConfiguration',
  );
  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');
  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );

  if (!isBarOrLineChart && !isAggregateChart && !isPieChart) {
    throw new Error('Invalid configuration type');
  }

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode?.objectMetadataId,
  );

  const selectedField = sourceObjectMetadataItem?.fields.find(
    (field) => field.id === currentFieldMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const availableAggregateOperations: AggregateChartOperation[] = selectedField
    ? isAggregateChart
      ? getAvailableAggregateOperationsForAggregateChart({
          fieldMetadataType: selectedField.type,
        })
      : getAvailableAggregateOperationsForFieldMetadataType({
          fieldMetadataType: selectedField.type,
        })
    : [];

  const filteredAggregateOperations = availableAggregateOperations.filter(
    (operation) => {
      return (
        isAggregateChart ||
        (operation !== DateAggregateOperations.EARLIEST &&
          operation !== DateAggregateOperations.LATEST)
      );
    },
  );

  const aggregateOperationsWithLabels = filteredAggregateOperations.map(
    (operation) => ({
      operation,
      label: getAggregateChartOperationLabel(operation),
    }),
  );

  const filteredAggregateOperationsWithLabels = filterBySearchQuery({
    items: aggregateOperationsWithLabels,
    searchQuery,
    getSearchableValues: (item) => [item.label],
  });

  if (!isDefined(sourceObjectMetadataItem) || !isDefined(selectedField)) {
    return null;
  }

  const handleSelectRatio = () => {
    setIsOptionValueMenuOpen(true);
  };

  if (isOptionValueMenuOpen) {
    return (
      <ChartRatioOptionValueSelectionDropdownContent
        currentFieldMetadataId={currentFieldMetadataId}
        setIsOptionValueMenuOpen={setIsOptionValueMenuOpen}
      />
    );
  }

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setIsSubMenuOpen(false)}
            Icon={IconChevronLeft}
          />
        }
      >
        {`${selectedField.label}`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search operations`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredAggregateOperationsWithLabels.map(
            (item) => item.operation,
          )}
        >
          {filteredAggregateOperationsWithLabels.map((item) =>
            item.operation === DASHBOARD_AGGREGATE_OPERATION_RATIO ? (
              <ChartRatioAggregateOperationSelectableListItem
                key={item.operation}
                label={item.label}
                onSelect={handleSelectRatio}
              />
            ) : (
              <ChartAggregateOperationSelectableListItem
                key={item.operation}
                operation={item.operation}
                label={item.label}
                currentFieldMetadataId={currentFieldMetadataId}
              />
            ),
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
