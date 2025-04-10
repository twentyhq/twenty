import { format } from 'date-fns';

import { AnalyticsCommonPropertiesType } from 'src/engine/core-modules/analytics/types/common.type';
import { pageviewSchema } from 'src/engine/core-modules/analytics/utils/events/pageview/pageview';
import {
  WEBHOOK_RESPONSE_EVENT,
  WebhookResponseTrackEvent,
} from 'src/engine/core-modules/analytics/utils/events/track/webhook/webhook-response';
import {
  eventsRegistry,
  GenericTrackEvent,
  genericTrackSchema,
} from 'src/engine/core-modules/analytics/utils/events/track/track';

const common = (): Record<AnalyticsCommonPropertiesType, string> => ({
  timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
});

export function makePageview(name: string, properties: object) {
  return pageviewSchema.parse({
    type: 'pageview',
    name,
    ...common(),
    ...properties,
  });
}

type SpecificTrackEvents = {
  [WEBHOOK_RESPONSE_EVENT]: WebhookResponseTrackEvent;
};

export function makeTrackEvent<E extends keyof SpecificTrackEvents>(
  event: E,
  properties: SpecificTrackEvents[E]['properties'],
): SpecificTrackEvents[E];
export function makeTrackEvent<E extends string>(
  event: E,
  properties: object,
): GenericTrackEvent<E>;
export function makeTrackEvent(event: string, properties: object) {
  const eventData = {
    type: 'track',
    event,
    ...common(),
    properties,
  };
  const schema = eventsRegistry.get(event);

  if (schema) {
    return schema.parse(eventData);
  }

  return genericTrackSchema.parse(eventData);
}
