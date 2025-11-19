import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { buildChartDrilldownUrl } from '@/page-layout/widgets/graph/utils/buildChartDrilldownUrl';
import { type LineSeries, type Point } from '@nivo/line';
import { type NavigateFunction } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';

export const handleLineChartPointClick = (
  point: Point<LineSeries>,
  dataMap: Record<string, LineChartSeries>,
  objectMetadataItem: ObjectMetadataItem,
  configuration: LineChartConfiguration,
  navigate: NavigateFunction,
) => {
  const series = dataMap[point.seriesId];
  if (!isDefined(series)) return;

  const dataPoint = series.data[point.indexInSeries];
  if (!isDefined(dataPoint)) return;

  const url = buildChartDrilldownUrl({
    objectMetadataItem,
    configuration,
    clickedData: {
      primaryBucketRawValue: dataPoint.__bucketRawValue ?? dataPoint.x,
    },
    timezone: configuration.timezone ?? undefined,
  });

  navigate(url);
};
