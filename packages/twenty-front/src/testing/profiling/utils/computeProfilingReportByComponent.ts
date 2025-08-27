import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';
import { type ProfilingReportByComponent } from '~/testing/profiling/types/ProfilingReportByComponent';

export const computeProfilingReportByComponent = (
  profilingReport: Record<string, ProfilingDataPoint[]>,
) => {
  const reportByComponent = {} as ProfilingReportByComponent;

  const dataPoints = Object.entries(profilingReport)
    .map(([, dataPoints]) => dataPoints)
    .flat(1);

  for (const dataPoint of dataPoints) {
    reportByComponent[dataPoint.componentName] = {
      ...reportByComponent?.[dataPoint.componentName],
      sumById: {
        ...reportByComponent?.[dataPoint.componentName]?.sumById,
        [dataPoint.id]:
          (reportByComponent[dataPoint.componentName]?.sumById?.[
            dataPoint.id
          ] ?? 0) + dataPoint.durationInMs,
      },
      sum:
        (reportByComponent[dataPoint.componentName]?.sum ?? 0) +
        dataPoint.durationInMs,
    };
  }

  for (const componentName of Object.keys(reportByComponent)) {
    const ids = Object.keys(reportByComponent[componentName].sumById);
    const valuesUnsorted = Object.values(
      reportByComponent[componentName].sumById,
    );

    const valuesSortedAsc = [...valuesUnsorted].sort((a, b) => a - b);

    const numberOfIds = ids.length;

    reportByComponent[componentName].average =
      reportByComponent[componentName].sum / numberOfIds;

    reportByComponent[componentName].min = Math.min(
      ...Object.values(reportByComponent[componentName].sumById),
    );

    reportByComponent[componentName].max = Math.max(
      ...Object.values(reportByComponent[componentName].sumById),
    );

    const p50Index = Math.floor(numberOfIds * 0.5);
    const p80Index = Math.floor(numberOfIds * 0.8);
    const p90Index = Math.floor(numberOfIds * 0.9);
    const p95Index = Math.floor(numberOfIds * 0.95);
    const p99Index = Math.floor(numberOfIds * 0.99);

    reportByComponent[componentName].p50 = valuesSortedAsc[p50Index];
    reportByComponent[componentName].p80 = valuesSortedAsc[p80Index];
    reportByComponent[componentName].p90 = valuesSortedAsc[p90Index];
    reportByComponent[componentName].p95 = valuesSortedAsc[p95Index];
    reportByComponent[componentName].p99 = valuesSortedAsc[p99Index];
  }

  return reportByComponent;
};
