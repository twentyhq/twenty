import { isDefined } from 'twenty-shared/utils';

import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';

export const closeWebPushNotificationsAndUnsubscribe = async () => {
  if (getBrowserNotificationPermission() === 'unsupported') {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!isDefined(registration)) {
    return;
  }

  const [notifications, webPushSubscription] = await Promise.all([
    registration.getNotifications(),
    registration.pushManager.getSubscription(),
  ]);

  notifications.forEach((notification) => notification.close());

  await webPushSubscription?.unsubscribe();
};
