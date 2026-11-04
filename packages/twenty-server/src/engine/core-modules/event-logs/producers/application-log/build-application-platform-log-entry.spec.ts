import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';

describe('buildApplicationPlatformLogEntry', () => {
  it('stamps the entry and leaves the logic function fields empty', () => {
    const entry = buildApplicationPlatformLogEntry({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      source: 'API_RATE_LIMIT',
      level: 'WARN',
      message: 'API rate limit reached.',
      errorCode: 'RATE_LIMITED',
    });

    expect(entry).toMatchObject({
      workspaceId: 'workspace-1',
      source: 'API_RATE_LIMIT',
      logicFunctionId: '',
      logicFunctionName: '',
      executionId: '',
      errorCode: 'RATE_LIMITED',
    });
    expect(entry.timestamp).toBeInstanceOf(Date);
  });
});
