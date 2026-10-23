import { ApplicationMetricEventRollupBuffer } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event-rollup-buffer';
import { type ApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event.type';

const EVENT: ApplicationMetricEvent = {
  timestamp: new Date('2026-10-19T08:41:12.204Z'),
  applicationRegistrationId: 'registration-1',
  workspaceId: 'workspace-1',
  applicationId: 'application-1',
  applicationVersion: '1.2.3',
  source: 'API_RATE_LIMIT',
  logicFunctionId: '',
  logicFunctionName: '',
  level: 'WARN',
  errorCode: 'RATE_LIMITED',
  durationMs: 0,
  occurrenceCount: 1,
};

describe('ApplicationMetricEventRollupBuffer', () => {
  it('sums the occurrences of the same event within a minute', () => {
    const buffer = new ApplicationMetricEventRollupBuffer(10);

    buffer.increment(EVENT);
    buffer.increment({
      ...EVENT,
      timestamp: new Date('2026-10-19T08:41:58.000Z'),
      occurrenceCount: 4,
    });

    expect(buffer.drain()).toEqual([{ ...EVENT, occurrenceCount: 5 }]);
  });

  it('keeps one row per install, source and minute', () => {
    const buffer = new ApplicationMetricEventRollupBuffer(10);

    buffer.increment(EVENT);
    buffer.increment({ ...EVENT, workspaceId: 'workspace-2' });
    buffer.increment({
      ...EVENT,
      source: 'JOB_RATE_LIMIT',
      errorCode: 'LIMIT_REACHED',
    });
    buffer.increment({
      ...EVENT,
      timestamp: new Date('2026-10-19T08:42:01.000Z'),
    });

    expect(buffer.drain()).toHaveLength(4);
  });

  it('keeps one row per logic function even when names collide', () => {
    const buffer = new ApplicationMetricEventRollupBuffer(10);
    const jobEvent: ApplicationMetricEvent = {
      ...EVENT,
      source: 'JOB_RATE_LIMIT',
      errorCode: 'LIMIT_REACHED',
      logicFunctionName: 'sync',
    };

    buffer.increment({ ...jobEvent, logicFunctionId: 'function-1' });
    buffer.increment({ ...jobEvent, logicFunctionId: 'function-2' });

    expect(buffer.drain()).toHaveLength(2);
  });

  it('keeps counting buffered rows but drops new ones once full', () => {
    const buffer = new ApplicationMetricEventRollupBuffer(1);

    buffer.increment(EVENT);
    buffer.increment({ ...EVENT, workspaceId: 'workspace-2' });
    buffer.increment({ ...EVENT, occurrenceCount: 2 });

    expect(buffer.drain()).toEqual([{ ...EVENT, occurrenceCount: 3 }]);
  });

  it('starts empty again once drained', () => {
    const buffer = new ApplicationMetricEventRollupBuffer(1);

    buffer.increment(EVENT);

    expect(buffer.isFull).toBe(true);

    buffer.drain();

    expect(buffer.isFull).toBe(false);
    expect(buffer.drain()).toEqual([]);
  });
});
