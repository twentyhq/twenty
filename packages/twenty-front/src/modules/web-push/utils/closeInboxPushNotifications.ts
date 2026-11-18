import { isDefined } from 'twenty-shared/utils';

export const closeInboxPushNotifications = async (threadIds: string[]) => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!isDefined(registration)) {
    return;
  }

  const notifications = await Promise.all(
    threadIds.map((threadId) =>
      registration.getNotifications({ tag: `inbox-${threadId}` }),
    ),
  );

  notifications.flat().forEach((notification) => notification.close());
};
