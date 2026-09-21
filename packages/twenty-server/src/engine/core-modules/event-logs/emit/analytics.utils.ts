import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { type EventCommonPropertiesType } from 'src/engine/core-modules/event-logs/emit/common.type';
import {
  type TrackEventName,
  type TrackEventProperties,
} from 'src/engine/core-modules/event-logs/emit/events.type';
import {
  type PageviewProperties,
  pageviewSchema,
} from 'src/engine/core-modules/event-logs/emit/events/pageview/pageview';
import {
  eventsRegistry,
  type GenericTrackEvent,
} from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

const common = (
  occurredAt: Date = new Date(),
): Record<EventCommonPropertiesType, string> => ({
  timestamp: formatDateTimeForClickHouse(occurredAt),
  version: '1',
});

export function makePageview(
  name: string,
  properties: Partial<PageviewProperties> = {},
) {
  return pageviewSchema.parse({
    type: 'page',
    name,
    ...common(),
    properties,
  });
}

export function makeTrackEvent<T extends TrackEventName>(
  event: T,
  properties: TrackEventProperties<T>,
  occurredAt?: Date,
): GenericTrackEvent<T> {
  const schema = eventsRegistry.get(event);

  if (!schema) {
    throw new Error(`Schema for event ${event} is not implemented`);
  }

  return schema.parse({
    type: 'track',
    event,
    properties,
    ...common(occurredAt),
  });
}
