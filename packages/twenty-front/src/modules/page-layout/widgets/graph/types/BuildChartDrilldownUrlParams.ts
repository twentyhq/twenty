import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export type BuildChartDrilldownUrlParams = {
  objectMetadataItem: ObjectMetadataItem;
  configuration: BarChartConfiguration | LineChartConfiguration;
  clickedData: {
    primaryBucketRawValue: RawDimensionValue;
  };
  viewId?: string;
  timezone?: string;
};
