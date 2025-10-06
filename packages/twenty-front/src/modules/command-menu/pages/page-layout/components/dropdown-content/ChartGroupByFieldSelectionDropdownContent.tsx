import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { Trans } from '@lingui/react/macro';

export const ChartGroupByFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase
      headerLabel={<Trans>Y-Axis Group By Field</Trans>}
      fieldMetadataIdKey="groupByFieldMetadataIdY"
      subFieldNameKey="groupBySubFieldNameY"
      allowedChartTypes={['BarChartConfiguration', 'LineChartConfiguration']}
    />
  );
};
