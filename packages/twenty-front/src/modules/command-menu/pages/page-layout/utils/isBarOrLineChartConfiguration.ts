import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { isBarChartConfiguration } from './isBarChartConfiguration';
import { isLineChartConfiguration } from './isLineChartConfiguration';

export const isBarOrLineChartConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is BarChartConfiguration | LineChartConfiguration => {
  return (
    isBarChartConfiguration(configuration) ||
    isLineChartConfiguration(configuration)
  );
};
