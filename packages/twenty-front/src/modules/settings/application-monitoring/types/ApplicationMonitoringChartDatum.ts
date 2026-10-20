export type ApplicationMonitoringChartDatum<TSeriesKey extends string> = {
  bucket: string;
} & Record<TSeriesKey, number>;
