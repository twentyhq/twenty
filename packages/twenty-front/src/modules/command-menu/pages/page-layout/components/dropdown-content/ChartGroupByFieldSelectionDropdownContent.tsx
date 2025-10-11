import { ChartGroupByFieldSelectionDropdownContentBase } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContentBase';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const ChartGroupByFieldSelectionDropdownContent = () => {
  return (
    <ChartGroupByFieldSelectionDropdownContentBase<
      BarChartConfiguration | LineChartConfiguration
    >
      fieldMetadataIdKey="groupByFieldMetadataIdY"
      subFieldNameKey="groupBySubFieldNameY"
    />
  );
};
