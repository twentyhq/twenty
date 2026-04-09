export type ProfilingReportItem = {
  sumById: { [id: string]: number };
  sum: number;
  dataPointCount: number;
  average: number;
  p50: number;
  p80: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  variance: number;
};

export type ProfilingReport = {
  total: Omit<ProfilingReportItem, 'sumById'>;
  runs: {
    [runName: string]: {
      runName: string;
    } & ProfilingReportItem;
  };
};
