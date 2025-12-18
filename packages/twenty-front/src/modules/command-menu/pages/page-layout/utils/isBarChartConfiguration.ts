import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type BarChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isBarChartConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is BarChartConfiguration => {
  return configuration?.__typename === 'BarChartConfiguration';
};
