import { type DashboardFilterValue } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type BarChartDataInput } from '~/generated-metadata/graphql';

// The server resolves each widget's field, so every filter with a value is sent
export const buildDashboardFilterChartDataInput = ({
  values,
  viewerTimeZone,
}: {
  values: DashboardFilterValue[];
  viewerTimeZone: string;
}): Pick<BarChartDataInput, 'dashboardFilterValues' | 'viewerTimeZone'> =>
  isNonEmptyArray(values)
    ? { dashboardFilterValues: values, viewerTimeZone }
    : {};
