import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { type PieChartConfiguration } from '~/generated/graphql';

export const ChartPieFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<PieChartConfiguration>
      fieldMetadataIdKey="groupByFieldMetadataId"
      subFieldNameKey="groupBySubFieldName"
    />
  );
};
