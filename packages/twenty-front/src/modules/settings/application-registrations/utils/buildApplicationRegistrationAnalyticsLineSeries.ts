import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { type ApplicationRegistrationAnalyticsTimeSeriesPoint } from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';

type ApplicationRegistrationAnalyticsTimeSeriesValues = Omit<
  ApplicationRegistrationAnalyticsTimeSeriesPoint,
  '__typename'
>;

export type ApplicationRegistrationAnalyticsSeriesDefinition = {
  key: string;
  label: string;
  field: keyof Omit<ApplicationRegistrationAnalyticsTimeSeriesValues, 'date'>;
};

export const buildApplicationRegistrationAnalyticsLineSeries = ({
  timeSeries,
  seriesDefinitions,
}: {
  timeSeries: ApplicationRegistrationAnalyticsTimeSeriesValues[];
  seriesDefinitions: ApplicationRegistrationAnalyticsSeriesDefinition[];
}): LineChartSeriesWithColor[] =>
  seriesDefinitions.map(({ key, label, field }) => ({
    key,
    label,
    data: timeSeries.map((point) => ({
      x: formatDate(point.date, 'MMM d'),
      y: point[field],
    })),
  }));
