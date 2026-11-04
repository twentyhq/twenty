export type ApplicationMonitoringChartDatum<TSeriesKey extends string> = Record<
  TSeriesKey,
  number
> & { bucketStart: string };
