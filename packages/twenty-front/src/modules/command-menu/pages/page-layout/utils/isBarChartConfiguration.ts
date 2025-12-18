import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type BarChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isBarChartConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldConfiguration
    | FieldsConfiguration
    | null
    | undefined,
): configuration is BarChartConfiguration => {
  return configuration?.__typename === 'BarChartConfiguration';
};
