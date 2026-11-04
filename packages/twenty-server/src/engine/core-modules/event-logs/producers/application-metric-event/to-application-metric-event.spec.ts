import { toApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/to-application-metric-event';

describe('toApplicationMetricEvent', () => {
  it('counts a platform log entry without duration or message', () => {
    const timestamp = new Date('2026-10-19T07:55:00.120Z');

    expect(
      toApplicationMetricEvent({
        timestamp,
        workspaceId: 'workspace-1',
        applicationId: 'application-1',
        applicationRegistrationId: 'registration-1',
        applicationVersion: '1.2.2',
        source: 'API_RATE_LIMIT',
        logicFunctionId: '',
        logicFunctionName: '',
        executionId: '',
        level: 'WARN',
        message: 'API rate limit reached. Requests are rejected for 2s.',
        errorCode: 'RATE_LIMITED',
      }),
    ).toEqual({
      timestamp,
      applicationRegistrationId: 'registration-1',
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationVersion: '1.2.2',
      source: 'API_RATE_LIMIT',
      logicFunctionId: '',
      logicFunctionName: '',
      level: 'WARN',
      errorCode: 'RATE_LIMITED',
      durationMs: 0,
      occurrenceCount: 1,
    });
  });
});
