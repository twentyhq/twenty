import { ChartAggregateOperationSelectableListItem } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartAggregateOperationSelectableListItem';
import { ChartRatioAggregateOperationSelectableListItem } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartRatioAggregateOperationSelectableListItem';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { type AggregateChartOperation } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/types/AggregateChartOperation';
import { getAggregateChartOperationLabel } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/utils/getAggregateChartOperationLabel';
import { getAvailableAggregateOperationsForAggregateChart } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/utils/getAvailableAggregateOperationsForAggregateChart';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { doNotTranslate } from 'twenty-shared/i18n';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ChartAggregateOperationSelectionDropdownContentProps = {
  currentFieldMetadataId: string;
};

export const ChartAggregateOperationSelectionDropdownContent = ({
  currentFieldMetadataId,
}: ChartAggregateOperationSelectionDropdownContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
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
    throw new Error(doNotTranslate('Invalid configuration type'));
  }

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode?.objectMetadataId,
  );

  const selectedField = sourceObjectMetadataItem?.fields.find(
    (field) => field.id === currentFieldMetadataId,
  );

  const availableAggregateOperations: AggregateChartOperation[] = isDefined(
    selectedField,
  )
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

  return (
    <>
      <Dropdown.Back aria-label={t`${selectedField.label}, back to fields`}>
        {selectedField.label}
      </Dropdown.Back>
      <Dropdown.Search
        placeholder={t`Search operations`}
        aria-label={t`Search operations`}
        onValueChange={setSearchQuery}
        value={searchQuery}
      />
      <Dropdown.Separator />
      <ChartSettingsDropdownSection>
        {filteredAggregateOperationsWithLabels.map((item) =>
          item.operation === DASHBOARD_AGGREGATE_OPERATION_RATIO ? (
            <ChartRatioAggregateOperationSelectableListItem
              key={item.operation}
              label={item.label}
              currentFieldMetadataId={currentFieldMetadataId}
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
        {!isNonEmptyArray(filteredAggregateOperationsWithLabels) && (
          <Dropdown.Empty>{t`No operations found`}</Dropdown.Empty>
        )}
      </ChartSettingsDropdownSection>
    </>
  );
};
