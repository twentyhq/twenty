import { buildApplicationApiRateLimitedLogEntry } from 'src/engine/api/common/common-query-runners/utils/build-application-api-rate-limited-log-entry.util';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const authContext = {
  workspace: { id: 'workspace-1' },
  application: {
    id: 'application-1',
    applicationRegistrationId: 'registration-1',
    version: '1.2.3',
  },
};

const exhaustedScope = {
  limitValue: 500,
  unit: UsageUnit.COMPLEXITY,
  retryAfterMs: 1200,
};

describe('buildApplicationApiRateLimitedLogEntry', () => {
  it('records the throttled app as a warning with the limit it hit', () => {
    expect(
      buildApplicationApiRateLimitedLogEntry({ authContext, exhaustedScope }),
    ).toMatchObject({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      source: 'API_RATE_LIMIT',
      level: 'WARN',
      message: 'API rate limit reached. Requests are rejected for 2s.',
      errorCode: 'RATE_LIMITED',
      properties: {
        limit: 500,
        unit: UsageUnit.COMPLEXITY,
        retryAfterMs: 1200,
      },
    });
  });
});
