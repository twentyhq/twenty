import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type GaugeChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isGaugeChartConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldConfiguration
    | FieldsConfiguration
    | null
    | undefined,
): configuration is GaugeChartConfiguration => {
  return configuration?.__typename === 'GaugeChartConfiguration';
};
