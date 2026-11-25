import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  MEET_PUBSUB_AUDIENCE_SERVER_VARIABLE_NAME,
  MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL_SERVER_VARIABLE_NAME,
} from 'src/constants/meet.constant';
import {
  MEET_EVENTS_RESOLVER_UNIVERSAL_IDENTIFIER,
  MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type GooglePubsubPushBody } from 'src/logic-functions/types/google-pubsub-push-body.type';
import { getMeetEventSubscriptionKey } from 'src/logic-functions/utils/get-meet-event-subscription-key.util';
import { isGooglePubsubPushAuthorized } from 'src/logic-functions/utils/is-google-pubsub-push-authorized.util';
import { parseMeetEventOrThrow } from 'src/logic-functions/utils/parse-meet-event-or-throw.util';

export const meetEventsResolverHandler = async ({
  headers,
  body,
}: Pick<
  RoutePayload<GooglePubsubPushBody>,
  'headers' | 'body'
>): Promise<ServerRouteResolverResult> => {
  const audience =
    process.env[MEET_PUBSUB_AUDIENCE_SERVER_VARIABLE_NAME];
  const serviceAccountEmail =
    process.env[MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL_SERVER_VARIABLE_NAME];

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

  const event = parseMeetEventOrThrow(body);

  if (!isDefined(event)) {
    return new Response({ ok: true, skipped: 'Not a Google Meet event' });
  }

  const workspaceId = await kv.get<string>(
    getMeetEventSubscriptionKey(event.subscriptionName),
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
      MEET_HANDLE_EVENT_UNIVERSAL_IDENTIFIER,
    payload: event,
  };
};

export default defineLogicFunction({
  universalIdentifier: MEET_EVENTS_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'meet-events-resolver',
  description:
    'Checks that a Google Meet event comes from the configured Pub/Sub subscription and routes it to the workspace that owns the Google account.',
  timeoutSeconds: 15,
  handler: meetEventsResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: ['authorization'],
  },
});
