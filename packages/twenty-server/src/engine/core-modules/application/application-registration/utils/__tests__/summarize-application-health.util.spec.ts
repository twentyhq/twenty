import { ApplicationHealthStatus } from 'twenty-shared/application';

import { summarizeApplicationHealth } from 'src/engine/core-modules/application/application-registration/utils/summarize-application-health.util';

describe('summarizeApplicationHealth', () => {
  it('counts unknown attempts as checked and counts reconnection and health issues only once', () => {
    expect(
      summarizeApplicationHealth({
        statuses: [
          ApplicationHealthStatus.ERROR,
          ApplicationHealthStatus.WARNING,
          ApplicationHealthStatus.OK,
          ApplicationHealthStatus.UNKNOWN,
          undefined,
        ],
        applications: [true, false, false, false, false].map(
          (needsReconnection) => ({ needsReconnection }),
        ),
      }),
    ).toEqual({ checked: 4, known: 3, needingAttention: 1 });
  });

  it('distinguishes unknown health from known healthy results', () => {
    expect(
      summarizeApplicationHealth({
        statuses: [undefined, ApplicationHealthStatus.UNKNOWN],
        applications: [
          { needsReconnection: false },
          { needsReconnection: false },
        ],
      }),
    ).toEqual({ checked: 1, known: 0, needingAttention: 0 });
  });
});
