import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';

export type BarChartSlice = {
  indexValue: string;
  bars: ComputedBarDatum<BarDatum>[];
  sliceLeft: number;
  sliceRight: number;
  sliceCenter: number;
};
