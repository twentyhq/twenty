import { type ProfilingReport } from '~/testing/profiling/types/ProfilingReportByRun';

export const parseProfilingReportString = (
  profilingReportStringifiedJson: string,
) => {
  return JSON.parse(profilingReportStringifiedJson) as ProfilingReport;
};
