import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type PieChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isPieChartConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldConfiguration
    | FieldsConfiguration
    | null
    | undefined,
): configuration is PieChartConfiguration => {
  return configuration?.__typename === 'PieChartConfiguration';
};
