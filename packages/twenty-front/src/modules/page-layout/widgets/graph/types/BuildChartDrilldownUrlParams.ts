import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export type BuildChartDrilldownUrlParams = {
  objectMetadataItem: ObjectMetadataItem;
  configuration: BarChartConfiguration | LineChartConfiguration;
  clickedData: {
    primaryBucketRawValue: unknown;
    secondaryBucketValue?: string;
  };
};
