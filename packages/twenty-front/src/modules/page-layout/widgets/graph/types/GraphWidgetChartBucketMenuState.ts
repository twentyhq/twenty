import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { type DashboardFilterValue } from 'twenty-shared/types';

export type GraphWidgetChartBucketMenuState = {
  bucketRawValue: RawDimensionValue;
  slotId: string;
  value: DashboardFilterValue;
  anchorPosition: { x: number; y: number } | null;
};
