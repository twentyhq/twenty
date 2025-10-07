import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { Trans } from '@lingui/react/macro';

export const ChartXAxisFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase
      headerLabel={<Trans>X-Axis Field</Trans>}
      fieldMetadataIdKey="groupByFieldMetadataIdX"
      subFieldNameKey="groupBySubFieldNameX"
      allowedChartTypes={['BarChartConfiguration', 'LineChartConfiguration']}
    />
  );
};
