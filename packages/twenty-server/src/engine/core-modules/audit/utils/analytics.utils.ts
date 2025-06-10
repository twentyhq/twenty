import { format } from 'date-fns';

import { AuditCommonPropertiesType } from 'src/engine/core-modules/audit/types/common.type';
import {
  TrackEventName,
  TrackEventProperties,
} from 'src/engine/core-modules/audit/types/events.type';
import {
  PageviewProperties,
  pageviewSchema,
} from 'src/engine/core-modules/audit/utils/events/pageview/pageview';
import {
  eventsRegistry,
  GenericTrackEvent,
} from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

const common = (): Record<AuditCommonPropertiesType, string> => ({
  timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
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
