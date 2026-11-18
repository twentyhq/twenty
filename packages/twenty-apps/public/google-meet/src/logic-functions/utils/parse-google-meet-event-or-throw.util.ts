import { isNonEmptyString } from '@sniptt/guards';

import { GOOGLE_WORKSPACE_EVENTS_SOURCE_PREFIX } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type GoogleMeetEvent } from 'src/logic-functions/types/google-meet-event.type';
import { type GooglePubsubPushBody } from 'src/logic-functions/types/google-pubsub-push-body.type';
import { parseGoogleMeetEventDataOrThrow } from 'src/logic-functions/utils/parse-google-meet-event-data-or-throw.util';

export const parseGoogleMeetEventOrThrow = (
  pushBody: GooglePubsubPushBody | null,
): GoogleMeetEvent | undefined => {
  const source = pushBody?.message?.attributes?.['ce-source'];
  const eventType = pushBody?.message?.attributes?.['ce-type'];

  if (
    !isNonEmptyString(source) ||
    !source.startsWith(GOOGLE_WORKSPACE_EVENTS_SOURCE_PREFIX) ||
    !isNonEmptyString(eventType)
  ) {
    return undefined;
  }

  const eventData = parseGoogleMeetEventDataOrThrow(pushBody?.message?.data);
  const artifactName =
    eventData.transcript?.name ??
    eventData.smartNote?.name ??
    eventData.recording?.name;

  return {
    subscriptionName: source.slice(
      GOOGLE_WORKSPACE_EVENTS_SOURCE_PREFIX.length,
    ),
    eventType,
    ...(isNonEmptyString(artifactName) ? { artifactName } : {}),
  };
};
