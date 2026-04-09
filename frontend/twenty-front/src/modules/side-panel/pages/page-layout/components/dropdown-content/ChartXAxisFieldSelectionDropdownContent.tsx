import { ChartGroupByFieldSelectionDropdownContentBase } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { type TypedBarChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedLineChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedLineChartConfiguration';

export const ChartXAxisFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<
      TypedBarChartConfiguration | TypedLineChartConfiguration
    >
      fieldMetadataIdKey="primaryAxisGroupByFieldMetadataId"
      subFieldNameKey="primaryAxisGroupBySubFieldName"
    />
  );
};
