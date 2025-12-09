import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';

export type BuildChartDrilldownQueryParamsInput = {
  objectMetadataItem: ObjectMetadataItem;
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
  clickedData: {
    primaryBucketRawValue: RawDimensionValue;
  };
  viewId?: string;
  timezone?: string;
};
