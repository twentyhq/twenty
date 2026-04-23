import { ChartGroupByFieldSelectionDropdownContentBase } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { type TypedBarChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedLineChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedLineChartConfiguration';

export const ChartGroupByFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<
      TypedBarChartConfiguration | TypedLineChartConfiguration
    >
      fieldMetadataIdKey="secondaryAxisGroupByFieldMetadataId"
      subFieldNameKey="secondaryAxisGroupBySubFieldName"
    />
  );
};
