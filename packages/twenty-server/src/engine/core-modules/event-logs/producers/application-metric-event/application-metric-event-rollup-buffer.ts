import { isDefined } from 'twenty-shared/utils';

import { type ApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event.type';

const MINUTE_IN_MS = 60_000;

const buildRollupKey = (event: ApplicationMetricEvent): string =>
  [
    event.applicationRegistrationId,
    event.workspaceId,
    event.applicationId,
    event.applicationVersion,
    event.source,
    event.logicFunctionId,
    event.level,
    event.errorCode,
    Math.floor(event.timestamp.getTime() / MINUTE_IN_MS),
  ].join('|');

export class ApplicationMetricEventRollupBuffer {
  private eventByKey = new Map<string, ApplicationMetricEvent>();

  constructor(private readonly maxEntries: number) {}

  get isFull(): boolean {
    return this.eventByKey.size >= this.maxEntries;
  }

  increment(event: ApplicationMetricEvent): void {
    const rollupKey = buildRollupKey(event);
    const bufferedEvent = this.eventByKey.get(rollupKey);

    if (isDefined(bufferedEvent)) {
      bufferedEvent.occurrenceCount += event.occurrenceCount;

      return;
    }

    if (this.isFull) {
      return;
    }

    this.eventByKey.set(rollupKey, { ...event });
  }

  drain(): ApplicationMetricEvent[] {
    const drainedEvents = [...this.eventByKey.values()];

    this.eventByKey = new Map();

    return drainedEvents;
  }
}
