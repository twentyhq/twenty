import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type GaugeChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isGaugeChartConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is GaugeChartConfiguration => {
  return configuration?.__typename === 'GaugeChartConfiguration';
};
