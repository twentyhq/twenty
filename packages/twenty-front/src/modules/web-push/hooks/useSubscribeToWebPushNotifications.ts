import { useMutation } from '@apollo/client/react';
import { Buffer } from 'buffer';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { base64UrlEncode, isDefined } from 'twenty-shared/utils';

import { webPushVapidPublicKeyState } from '@/client-config/states/webPushVapidPublicKeyState';
import { UPSERT_WEB_PUSH_SUBSCRIPTION } from '@/web-push/graphql/mutations/upsertWebPushSubscription';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';

const getOrCreateBrowserWebPushSubscription = async (
  applicationServerKey: string,
): Promise<PushSubscription> => {
  const registration =
    await navigator.serviceWorker.register('/service-worker.js');
  const existingSubscription = await registration.pushManager.getSubscription();

  if (isDefined(existingSubscription)) {
    const existingKey = existingSubscription.options.applicationServerKey;

    if (
      isDefined(existingKey) &&
      base64UrlEncode(Buffer.from(existingKey)) === applicationServerKey
    ) {
      return existingSubscription;
    }

    await existingSubscription.unsubscribe();
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
};

export const useSubscribeToWebPushNotifications = () => {
  const store = useStore();
  const [upsertWebPushSubscription] = useMutation(UPSERT_WEB_PUSH_SUBSCRIPTION);

  const subscribeToWebPushNotifications = useCallback(async () => {
    const applicationServerKey = store.get(webPushVapidPublicKeyState.atom);

    if (
      !isDefined(applicationServerKey) ||
      getBrowserNotificationPermission() !== 'granted'
    ) {
      return;
    }

    const { endpoint, keys } = (
      await getOrCreateBrowserWebPushSubscription(applicationServerKey)
    ).toJSON();

    if (!isDefined(endpoint) || !isDefined(keys)) {
      return;
    }

    await upsertWebPushSubscription({
      variables: {
        input: {
          endpoint,
          p256dhKey: keys.p256dh,
          authSecret: keys.auth,
          applicationServerKey,
        },
      },
    });
  }, [store, upsertWebPushSubscription]);

  return { subscribeToWebPushNotifications };
};
