import { type ChartFilter } from 'twenty-shared/types';

export type DashboardFilterChartFieldHandOver = {
  pageLayoutFilterId: string;
  label: string;
  hasDefaultValue: boolean;
  fieldMetadataId: string;
  filterWithoutFieldConditions: ChartFilter;
};
