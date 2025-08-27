import { isNonEmptyString } from '@sniptt/guards';
import { PROFILING_REPORTER_DIV_ID } from '~/testing/profiling/constants/ProfilingReporterDivId';
import { type ProfilingReport } from '~/testing/profiling/types/ProfilingReportByRun';
import { parseProfilingReportString } from '~/testing/profiling/utils/parseProfilingReportString';
import { isDefined } from 'twenty-shared/utils';

export const getProfilingReportFromDocument = (
  documentElement: Element,
): ProfilingReport | null => {
  const profilingReportElement = documentElement.querySelector(
    `#${PROFILING_REPORTER_DIV_ID}`,
  );

  if (!isDefined(profilingReportElement)) {
    return null;
  }

  const profilingReportString = profilingReportElement.getAttribute(
    'data-profiling-report',
  );

  if (!isNonEmptyString(profilingReportString)) {
    return null;
  }

  const parsedProfilingReport = parseProfilingReportString(
    profilingReportString,
  );

  return parsedProfilingReport;
};
