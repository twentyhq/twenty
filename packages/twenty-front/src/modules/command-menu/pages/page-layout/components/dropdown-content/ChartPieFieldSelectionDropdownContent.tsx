import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { type TypedPieChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedPieChartConfiguration';

export const ChartPieFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<TypedPieChartConfiguration>
      fieldMetadataIdKey="groupByFieldMetadataId"
      subFieldNameKey="groupBySubFieldName"
    />
  );
};
