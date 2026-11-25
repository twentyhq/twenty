import { isNonEmptyString } from '@sniptt/guards';

import { GOOGLE_WORKSPACE_EVENTS_SOURCE_PREFIX } from 'src/logic-functions/constants/google-workspace-events.constant';
import { type MeetEvent } from 'src/logic-functions/types/meet-event.type';
import { type GooglePubsubPushBody } from 'src/logic-functions/types/google-pubsub-push-body.type';
import { parseMeetEventDataOrThrow } from 'src/logic-functions/utils/parse-meet-event-data-or-throw.util';

export const parseMeetEventOrThrow = (
  pushBody: GooglePubsubPushBody | null,
): MeetEvent | undefined => {
  const source = pushBody?.message?.attributes?.['ce-source'];
  const eventType = pushBody?.message?.attributes?.['ce-type'];

  if (
    !isNonEmptyString(source) ||
    !source.startsWith(GOOGLE_WORKSPACE_EVENTS_SOURCE_PREFIX) ||
    !isNonEmptyString(eventType)
  ) {
    return undefined;
  }

  const eventData = parseMeetEventDataOrThrow(pushBody?.message?.data);
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
