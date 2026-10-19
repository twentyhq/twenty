import { buildApplicationLogEnvelopes } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-log-envelopes';

const ENTRY = {
  timestamp: new Date('2026-10-19T08:41:12.204Z'),
  workspaceId: 'workspace-1',
  applicationId: 'application-1',
  applicationRegistrationId: 'registration-1',
  applicationVersion: '1.2.3',
  source: 'LOGIC_FUNCTION' as const,
  logicFunctionId: 'function-1',
  logicFunctionName: 'syncContacts',
  executionId: 'execution-1',
  level: 'INFO',
  message: 'Synced 214 contacts.',
};

describe('buildApplicationLogEnvelopes', () => {
  it('maps an entry to an applicationLog row with empty error code and properties', () => {
    expect(buildApplicationLogEnvelopes([ENTRY])).toEqual([
      {
        table: 'applicationLog',
        row: {
          timestamp: '2026-10-19 08:41:12.204',
          workspaceId: 'workspace-1',
          applicationId: 'application-1',
          applicationRegistrationId: 'registration-1',
          applicationVersion: '1.2.3',
          source: 'LOGIC_FUNCTION',
          logicFunctionId: 'function-1',
          logicFunctionName: 'syncContacts',
          executionId: 'execution-1',
          level: 'INFO',
          message: 'Synced 214 contacts.',
          errorCode: '',
          properties: {},
        },
      },
    ]);
  });

  it('keeps the error code and properties of an entry', () => {
    const [envelope] = buildApplicationLogEnvelopes([
      {
        ...ENTRY,
        level: 'ERROR',
        errorCode: 'TypeError',
        properties: { stackTrace: ['TypeError: boom'] },
      },
    ]);

    expect(envelope.row).toMatchObject({
      errorCode: 'TypeError',
      properties: { stackTrace: ['TypeError: boom'] },
    });
  });
});
