import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { PROFILING_REPORTER_DIV_ID } from '~/testing/profiling/constants/ProfilingReporterDivId';
import { currentProfilingRunIndexState } from '~/testing/profiling/states/currentProfilingRunIndexState';
import { profilingSessionDataPointsState } from '~/testing/profiling/states/profilingSessionDataPointsState';
import { profilingSessionStatusState } from '~/testing/profiling/states/profilingSessionStatusState';
import { computeProfilingReport } from '~/testing/profiling/utils/computeProfilingReport';

const StyledTable = styled.table`
  border: 1px solid black;

  th,
  td {
    border: 1px solid black;
  }

  td {
    padding: 5px;
  }
`;

export const ProfilingReporter = () => {
  const [profilingSessionDataPoints] = useRecoilState(
    profilingSessionDataPointsState,
  );

  const [currentProfilingRunIndex] = useRecoilState(
    currentProfilingRunIndexState,
  );

  const [profilingSessionStatus] = useRecoilState(profilingSessionStatusState);

  const profilingReport = useMemo(
    () => computeProfilingReport(profilingSessionDataPoints),
    [profilingSessionDataPoints],
  );

  return (
    <div
      data-profiling-report={JSON.stringify(profilingReport)}
      id={PROFILING_REPORTER_DIV_ID}
    >
      <h2>Profiling report</h2>
      <div>
        Run #{currentProfilingRunIndex} - Status {profilingSessionStatus}
      </div>
      <StyledTable>
        <thead>
          <tr>
            <th>Run name</th>
            <th>Min</th>
            <th>Average</th>
            <th>P50</th>
            <th>P80</th>
            <th>P90</th>
            <th>P95</th>
            <th>P99</th>
            <th>Max</th>
            <th>Variance</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ fontWeight: 'bold' }}>
            <td>Total</td>
            <td>{Math.round(profilingReport.total.min * 1000) / 1000}ms</td>
            <td>{Math.round(profilingReport.total.average * 1000) / 1000}ms</td>
            <td>{Math.round(profilingReport.total.p50 * 1000) / 1000}ms</td>
            <td>{Math.round(profilingReport.total.p80 * 1000) / 1000}ms</td>
            <td>{Math.round(profilingReport.total.p90 * 1000) / 1000}ms</td>
            <td>{Math.round(profilingReport.total.p95 * 1000) / 1000}ms</td>
            <td>{Math.round(profilingReport.total.p99 * 1000) / 1000}ms</td>
            <td>{Math.round(profilingReport.total.max * 1000) / 1000}ms</td>
            <td>
              {Math.round(profilingReport.total.variance * 1000000) / 1000000}
            </td>
          </tr>
          {Object.entries(profilingReport.runs).map(([runName, report]) => (
            <tr key={runName}>
              <td>{runName}</td>
              <td>{Math.round(report.min * 1000) / 1000}ms</td>
              <td>{Math.round(report.average * 1000) / 1000}ms</td>
              <td>{Math.round(report.p50 * 1000) / 1000}ms</td>
              <td>{Math.round(report.p80 * 1000) / 1000}ms</td>
              <td>{Math.round(report.p90 * 1000) / 1000}ms</td>
              <td>{Math.round(report.p95 * 1000) / 1000}ms</td>
              <td>{Math.round(report.p99 * 1000) / 1000}ms</td>
              <td>{Math.round(report.max * 1000) / 1000}ms</td>
              <td>{Math.round(report.variance * 1000000) / 1000000}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
};
