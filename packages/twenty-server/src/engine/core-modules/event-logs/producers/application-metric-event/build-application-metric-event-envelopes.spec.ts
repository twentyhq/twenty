import { type ApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event.type';
import { buildApplicationMetricEventEnvelopes } from 'src/engine/core-modules/event-logs/producers/application-metric-event/build-application-metric-event-envelopes';

const EVENT: ApplicationMetricEvent = {
  timestamp: new Date('2026-10-19T08:41:12.204Z'),
  applicationRegistrationId: 'registration-1',
  workspaceId: 'workspace-1',
  applicationId: 'application-1',
  applicationVersion: '1.2.3',
  source: 'LOGIC_FUNCTION',
  logicFunctionId: 'function-1',
  logicFunctionName: 'syncContacts',
  level: 'ERROR',
  errorCode: 'TypeError',
  durationMs: 1240.6,
  occurrenceCount: 1,
};

describe('buildApplicationMetricEventEnvelopes', () => {
  it('maps an event to an applicationMetricEvent row with a whole duration', () => {
    expect(buildApplicationMetricEventEnvelopes([EVENT])).toEqual([
      {
        table: 'applicationMetricEvent',
        row: {
          ...EVENT,
          timestamp: '2026-10-19 08:41:12.204',
          durationMs: 1241,
        },
      },
    ]);
  });

  it('drops events that are not tied to an app registration', () => {
    expect(
      buildApplicationMetricEventEnvelopes([
        { ...EVENT, applicationRegistrationId: '' },
      ]),
    ).toEqual([]);
  });
});
