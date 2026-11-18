import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { webPushVapidPublicKeyState } from '@/client-config/states/webPushVapidPublicKeyState';
import { UPSERT_PUSH_SUBSCRIPTION } from '@/web-push/graphql/mutations/upsertPushSubscription';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';

const encodeBase64Url = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const getPushSubscription = async (
  applicationServerKey: string,
): Promise<PushSubscription> => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  const existingSubscription = await registration.pushManager.getSubscription();

  if (isDefined(existingSubscription)) {
    const existingKey = existingSubscription.options.applicationServerKey;

    if (
      isDefined(existingKey) &&
      encodeBase64Url(existingKey) === applicationServerKey
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

export const useSubscribeToPushNotifications = () => {
  const store = useStore();
  const [upsertPushSubscription] = useMutation(UPSERT_PUSH_SUBSCRIPTION);

  const subscribeToPushNotifications = useCallback(async () => {
    const applicationServerKey = store.get(webPushVapidPublicKeyState.atom);

    if (
      !isDefined(applicationServerKey) ||
      getBrowserNotificationPermission() !== 'granted'
    ) {
      return;
    }

    const { endpoint, keys } = (
      await getPushSubscription(applicationServerKey)
    ).toJSON();

    if (!isDefined(endpoint) || !isDefined(keys)) {
      return;
    }

    await upsertPushSubscription({
      variables: {
        input: {
          endpoint,
          p256dhKey: keys.p256dh,
          authSecret: keys.auth,
          applicationServerKey,
        },
      },
    });
  }, [store, upsertPushSubscription]);

  return { subscribeToPushNotifications };
};
