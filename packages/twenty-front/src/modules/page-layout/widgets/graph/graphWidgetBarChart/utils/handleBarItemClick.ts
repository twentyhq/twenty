import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { buildChartDrilldownUrl } from '@/page-layout/widgets/graph/utils/buildChartDrilldownUrl';
import { type ComputedDatum } from '@nivo/bar';
import { type NavigateFunction } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  BarChartGroupMode,
  type BarChartConfiguration,
} from '~/generated/graphql';

export const handleBarItemClick = (
  datum: ComputedDatum<BarChartDataItem>,
  series: BarChartSeries[] | undefined,
  objectMetadataItem: ObjectMetadataItem,
  configuration: BarChartConfiguration,
  navigate: NavigateFunction,
) => {
  const bucketRawValue = (
    datum.data as unknown as { __bucketRawValue?: unknown }
  ).__bucketRawValue;

  if (!isDefined(bucketRawValue)) return;

  const hasSecondaryDimension = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  );

  const seriesItem = series?.find((s) => s.key === String(datum.id));
  const secondaryBucketRawValue = seriesItem?.rawValue ?? datum.id;

  const url = buildChartDrilldownUrl({
    objectMetadataItem,
    configuration,
    clickedData: {
      primaryBucketRawValue: bucketRawValue,
      secondaryBucketValue:
        hasSecondaryDimension &&
        configuration.groupMode !== BarChartGroupMode.STACKED
          ? String(secondaryBucketRawValue)
          : undefined,
    },
  });

  navigate(url);
};
