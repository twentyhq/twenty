import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';
import { type ProfilingReport } from '~/testing/profiling/types/ProfilingReportByRun';
import { isDefined } from 'twenty-shared/utils';

export const computeProfilingReport = (
  dataPoints: ProfilingDataPoint[],
  varianceThreshold?: number,
) => {
  const profilingReport = { total: {}, runs: {} } as ProfilingReport;

  for (const dataPoint of dataPoints) {
    profilingReport.runs[dataPoint.runName] = {
      ...profilingReport.runs[dataPoint.runName],
      sumById: {
        ...profilingReport.runs[dataPoint.runName]?.sumById,
        [dataPoint.id]:
          (profilingReport.runs[dataPoint.runName]?.sumById?.[dataPoint.id] ??
            0) + dataPoint.durationInMs,
      },
      sum:
        (profilingReport.runs[dataPoint.runName]?.sum ?? 0) +
        dataPoint.durationInMs,
    } as ProfilingReport['runs'][string];
  }

  for (const run of Object.values(profilingReport.runs)) {
    const ids = Object.keys(run.sumById);
    const valuesUnsorted = Object.values(run.sumById);

    const valuesSortedAsc = [...valuesUnsorted].sort((a, b) => a - b);

    const numberOfIds = ids.length;

    const mean = run.sum / numberOfIds;

    run.average = mean;

    run.min = Math.min(...valuesUnsorted);

    run.max = Math.max(...valuesUnsorted);

    const intermediaryValuesForVariance = valuesUnsorted.map((value) =>
      Math.pow(value - mean, 2),
    );

    run.variance =
      intermediaryValuesForVariance.reduce((acc, curr) => acc + curr) /
      numberOfIds;

    const p50Index = Math.floor(numberOfIds * 0.5);
    const p80Index = Math.floor(numberOfIds * 0.8);
    const p90Index = Math.floor(numberOfIds * 0.9);
    const p95Index = Math.floor(numberOfIds * 0.95);
    const p99Index = Math.floor(numberOfIds * 0.99);

    run.p50 = valuesSortedAsc[p50Index] ?? 0;
    run.p80 = valuesSortedAsc[p80Index] ?? 0;
    run.p90 = valuesSortedAsc[p90Index] ?? 0;
    run.p95 = valuesSortedAsc[p95Index] ?? 0;
    run.p99 = valuesSortedAsc[p99Index] ?? 0;
  }

  const runNamesForTotal = Object.keys(profilingReport.runs).filter((runName) =>
    runName.startsWith('real-run'),
  );

  const runsForTotal = runNamesForTotal
    .map((runName) => profilingReport.runs[runName])
    .filter(isDefined)
    .filter((run) => run.variance < (varianceThreshold ?? 0.2));

  profilingReport.total = {
    sum: Object.values(runsForTotal).reduce((acc, run) => acc + run.sum, 0),
    average:
      Object.values(runsForTotal).reduce((acc, run) => acc + run.average, 0) /
      Object.keys(runsForTotal).length,
    min: Math.min(...Object.values(runsForTotal).map((run) => run.min)),
    max: Math.max(...Object.values(runsForTotal).map((run) => run.max)),
    p50:
      Object.values(runsForTotal).reduce((acc, run) => acc + run.p50, 0) /
      Object.keys(runsForTotal).length,
    p80:
      Object.values(runsForTotal).reduce((acc, run) => acc + run.p80, 0) /
      Object.keys(runsForTotal).length,
    p90:
      Object.values(runsForTotal).reduce((acc, run) => acc + run.p90, 0) /
      Object.keys(runsForTotal).length,
    p95:
      Object.values(runsForTotal).reduce((acc, run) => acc + run.p95, 0) /
      Object.keys(runsForTotal).length,
    p99:
      Object.values(runsForTotal).reduce((acc, run) => acc + run.p99, 0) /
      Object.keys(runsForTotal).length,
    dataPointCount: dataPoints.length,
    variance:
      runsForTotal.reduce((acc, run) => acc + run.variance, 0) /
      runsForTotal.length,
  };

  return profilingReport;
};
