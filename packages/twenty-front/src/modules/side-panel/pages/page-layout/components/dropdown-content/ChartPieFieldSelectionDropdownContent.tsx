import { ChartGroupByFieldSelectionDropdownContentBase } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { type TypedPieChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedPieChartConfiguration';

export const ChartPieFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<TypedPieChartConfiguration>
      fieldMetadataIdKey="groupByFieldMetadataId"
      subFieldNameKey="groupBySubFieldName"
    />
  );
};
