import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type AggregateChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isAggregateChartConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldConfiguration
    | FieldsConfiguration
    | null
    | undefined,
): configuration is AggregateChartConfiguration => {
  return configuration?.__typename === 'AggregateChartConfiguration';
};
