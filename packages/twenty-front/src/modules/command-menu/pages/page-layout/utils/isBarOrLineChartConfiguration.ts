import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { isBarChartConfiguration } from './isBarChartConfiguration';
import { isLineChartConfiguration } from './isLineChartConfiguration';

export const isBarOrLineChartConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldConfiguration
    | FieldsConfiguration
    | null
    | undefined,
): configuration is BarChartConfiguration | LineChartConfiguration => {
  return (
    isBarChartConfiguration(configuration) ||
    isLineChartConfiguration(configuration)
  );
};
