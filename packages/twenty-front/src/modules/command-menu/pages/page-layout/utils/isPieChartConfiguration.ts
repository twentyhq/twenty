import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type PieChartConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export const isPieChartConfiguration = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is PieChartConfiguration => {
  return configuration?.__typename === 'PieChartConfiguration';
};
