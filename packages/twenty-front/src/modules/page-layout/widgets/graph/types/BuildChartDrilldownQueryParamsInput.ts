import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { type FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

export type BuildChartDrilldownQueryParamsInput = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
  clickedData: {
    primaryBucketRawValue: RawDimensionValue;
  };
  viewId?: string;
  timezone?: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};
