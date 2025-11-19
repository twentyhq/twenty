import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { buildChartDrilldownUrl } from '@/page-layout/widgets/graph/utils/buildChartDrilldownUrl';
import { type ComputedDatum } from '@nivo/bar';
import { type NavigateFunction } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';

export const handleBarItemClick = (
  datum: ComputedDatum<BarChartDataItem>,
  objectMetadataItem: ObjectMetadataItem,
  configuration: BarChartConfiguration,
  navigate: NavigateFunction,
) => {
  const bucketRawValue = (
    datum.data as unknown as { __bucketRawValue?: unknown }
  ).__bucketRawValue;

  if (!isDefined(bucketRawValue)) return;

  const url = buildChartDrilldownUrl({
    objectMetadataItem,
    configuration,
    clickedData: {
      primaryBucketRawValue: bucketRawValue,
    },
    timezone: configuration.timezone ?? undefined,
  });

  navigate(url);
};
