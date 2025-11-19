import { type BarDatum } from '@nivo/bar';

export type BarChartDataItem = BarDatum & {
  to?: string;
  __bucketRawValue?: unknown;
};
