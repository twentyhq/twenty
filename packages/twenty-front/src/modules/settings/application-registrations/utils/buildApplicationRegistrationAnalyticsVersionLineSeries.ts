import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { type ApplicationRegistrationAnalyticsVersionTimeSeriesPoint } from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';

type ApplicationRegistrationAnalyticsVersionAdoption = {
  version: string;
  timeSeries: Omit<
    ApplicationRegistrationAnalyticsVersionTimeSeriesPoint,
    '__typename'
  >[];
};

export const buildApplicationRegistrationAnalyticsVersionLineSeries = (
  versions: ApplicationRegistrationAnalyticsVersionAdoption[],
): LineChartSeriesWithColor[] =>
  versions.map(({ version, timeSeries }) => ({
    key: version,
    label: version,
    data: timeSeries.map((point) => ({
      x: formatDate(point.date, 'MMM d'),
      y: point.activeWorkspaces,
    })),
  }));
