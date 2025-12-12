import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type WaffleChartConfiguration,
} from '~/generated/graphql';

export type BuildChartDrilldownQueryParamsInput = {
  objectMetadataItem: ObjectMetadataItem;
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration
	| WaffleChartConfiguration;
  clickedData: {
    primaryBucketRawValue: RawDimensionValue;
  };
  viewId?: string;
  timezone?: string;
};
