import { timingSafeEqual } from 'node:crypto';
import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type GraphChangeNotification } from 'src/features/transcripts/logic-functions/types/graph-change-notification.type';
import { type TeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/types/teams-transcript-subscription.type';

type SubscriptionCredentials = Pick<
  TeamsTranscriptSubscription,
  'subscriptionId' | 'clientState'
>;

const isMatchingClientState = (
  receivedClientState: unknown,
  expectedClientState: string,
): boolean => {
  if (!isNonEmptyString(receivedClientState)) {
    return false;
  }

  const received = Buffer.from(receivedClientState);
  const expected = Buffer.from(expectedClientState);

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
};

const isSubscriptionNotification = (
  notification: unknown,
  subscription: SubscriptionCredentials,
): notification is GraphChangeNotification =>
  isObject<Record<string, unknown>, unknown>(notification) &&
  notification.subscriptionId === subscription.subscriptionId &&
  isMatchingClientState(notification.clientState, subscription.clientState);

export const parseTeamsTranscriptSubscriptionNotifications = ({
  body,
  subscription,
}: {
  body: unknown;
  subscription: SubscriptionCredentials;
}): GraphChangeNotification[] | undefined => {
  if (
    !isObject<Record<string, unknown>, unknown>(body) ||
    !Array.isArray(body.value)
  ) {
    return undefined;
  }

  const notifications: unknown[] = body.value;
  const subscriptionNotifications = notifications.filter(
    (notification): notification is GraphChangeNotification =>
      isSubscriptionNotification(notification, subscription),
  );

  return subscriptionNotifications.length === notifications.length
    ? subscriptionNotifications
    : undefined;
};
