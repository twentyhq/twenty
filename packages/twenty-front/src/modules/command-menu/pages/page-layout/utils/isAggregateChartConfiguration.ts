import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type AggregateChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isAggregateChartConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is AggregateChartConfiguration => {
  return configuration?.__typename === 'AggregateChartConfiguration';
};
