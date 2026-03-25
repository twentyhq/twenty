export type ProfilingReportByComponent = {
  [componentName: string]: {
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
  };
};
