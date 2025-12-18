import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type LineChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isLineChartConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is LineChartConfiguration => {
  return configuration?.__typename === 'LineChartConfiguration';
};
