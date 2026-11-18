import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { webPushVapidPublicKeyState } from '@/client-config/states/webPushVapidPublicKeyState';
import { UPSERT_PUSH_SUBSCRIPTION } from '@/web-push/graphql/mutations/upsertPushSubscription';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';
import { getPushSubscriptionForKey } from '@/web-push/utils/getPushSubscriptionForKey';

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
      await getPushSubscriptionForKey({
        registration: await navigator.serviceWorker.register('/sw.js'),
        applicationServerKey,
      })
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
