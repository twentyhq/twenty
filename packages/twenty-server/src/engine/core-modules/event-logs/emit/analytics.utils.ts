import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
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

const common = (): Record<EventCommonPropertiesType, string> => ({
  timestamp: formatDateTimeForClickHouse(new Date()),
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
): GenericTrackEvent<T> {
  const schema = eventsRegistry.get(event);

  if (!schema) {
    throw new Error(`Schema for event ${event} is not implemented`);
  }

  return schema.parse({
    type: 'track',
    event,
    properties,
    ...common(),
  });
}
