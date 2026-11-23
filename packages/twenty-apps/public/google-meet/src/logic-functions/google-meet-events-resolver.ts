import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GOOGLE_MEET_PUBSUB_AUDIENCE_SERVER_VARIABLE_NAME,
  GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL_SERVER_VARIABLE_NAME,
} from 'src/constants/google-meet.constant';
import {
  GOOGLE_MEET_EVENTS_RESOLVER_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type GooglePubsubPushBody } from 'src/logic-functions/types/google-pubsub-push-body.type';
import { getGoogleMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-google-meet-event-subscription-key.util';
import { isGooglePubsubPushAuthorized } from 'src/logic-functions/utils/is-google-pubsub-push-authorized.util';
import { parseGoogleMeetEventOrThrow } from 'src/logic-functions/utils/parse-google-meet-event-or-throw.util';

export const googleMeetEventsResolverHandler = async ({
  headers,
  body,
}: Pick<
  RoutePayload<GooglePubsubPushBody>,
  'headers' | 'body'
>): Promise<ServerRouteResolverResult> => {
  const audience =
    process.env[GOOGLE_MEET_PUBSUB_AUDIENCE_SERVER_VARIABLE_NAME];
  const serviceAccountEmail =
    process.env[GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL_SERVER_VARIABLE_NAME];

  if (!isNonEmptyString(audience) || !isNonEmptyString(serviceAccountEmail)) {
    return new Response(
      { error: 'Google Meet events are not configured' },
      { status: 503 },
    );
  }

  const isAuthorized = await isGooglePubsubPushAuthorized({
    authorizationHeader: headers.authorization,
    audience,
    serviceAccountEmail,
  });

  if (!isAuthorized) {
    return new Response({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = parseGoogleMeetEventOrThrow(body);

  if (!isDefined(event)) {
    return new Response({ ok: true, skipped: 'Not a Google Meet event' });
  }

  const workspaceId = await kv.get<string>(
    getGoogleMeetEventSubscriptionKey(event.subscriptionName),
    { scope: 'SERVER' },
  );

  if (!isNonEmptyString(workspaceId)) {
    return new Response({
      ok: true,
      skipped: 'No workspace claims this subscription',
    });
  }

  return {
    workspaceId,
    targetLogicFunctionUniversalIdentifier:
      GOOGLE_MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
    payload: event,
  };
};

export default defineLogicFunction({
  universalIdentifier: GOOGLE_MEET_EVENTS_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-events-resolver',
  description:
    'Checks that a Google Meet event comes from the configured Pub/Sub subscription and routes it to the workspace that owns the Google account.',
  timeoutSeconds: 15,
  handler: googleMeetEventsResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: ['authorization'],
  },
});
