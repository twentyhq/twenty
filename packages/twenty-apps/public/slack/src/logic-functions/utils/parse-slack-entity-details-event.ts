import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

type ParsedSlackEntityDetailsEvent =
  | {
      detailsRequest: {
        triggerId: string;
        slackUserId: string;
        entityUrl: string | undefined;
        externalRef: { id: string; type: string | undefined } | undefined;
      };
    }
  | { detailsRequest: null; skipReason: string };

export const parseSlackEntityDetailsEvent = (
  body: SlackEventsRequestBody,
): ParsedSlackEntityDetailsEvent => {
  if (body.type !== 'event_callback') {
    return {
      detailsRequest: null,
      skipReason: `Unhandled body type: ${body.type}`,
    };
  }

  const event = body.event;

  if (!isDefined(event)) {
    return { detailsRequest: null, skipReason: 'Missing event payload' };
  }

  if (event.type !== 'entity_details_requested') {
    return {
      detailsRequest: null,
      skipReason: `Unhandled event type: ${event.type}`,
    };
  }

  if (!isNonEmptyString(event.trigger_id)) {
    return { detailsRequest: null, skipReason: 'Event has no trigger_id' };
  }

  if (!isNonEmptyString(event.user)) {
    return { detailsRequest: null, skipReason: 'Event has no user' };
  }

  const entityUrl = [event.link?.url, event.entity_url].find(isNonEmptyString);

  const externalRefId = event.external_ref?.id;
  const externalRef = isNonEmptyString(externalRefId)
    ? {
        id: externalRefId,
        type: isNonEmptyString(event.external_ref?.type)
          ? event.external_ref.type
          : undefined,
      }
    : undefined;

  return {
    detailsRequest: {
      triggerId: event.trigger_id,
      slackUserId: event.user,
      entityUrl,
      externalRef,
    },
  };
};
