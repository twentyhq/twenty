import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import { type TypedBarChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedLineChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedLineChartConfiguration';

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
