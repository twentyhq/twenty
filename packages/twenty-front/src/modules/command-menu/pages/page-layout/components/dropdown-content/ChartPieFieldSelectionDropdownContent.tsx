import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { Trans } from '@lingui/react/macro';

export const ChartPieFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase
      headerLabel={<Trans>Each slice represents</Trans>}
      fieldMetadataIdKey="groupByFieldMetadataId"
      subFieldNameKey="groupBySubFieldName"
      allowedChartTypes={['PieChartConfiguration']}
    />
  );
};
