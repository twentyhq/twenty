import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { webPushVapidPublicKeyState } from '@/client-config/states/webPushVapidPublicKeyState';
import { UPSERT_WEB_PUSH_SUBSCRIPTION } from '@/web-push/graphql/mutations/upsertWebPushSubscription';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';
import { getOrCreateBrowserWebPushSubscription } from '@/web-push/utils/getOrCreateBrowserWebPushSubscription';

export const useSubscribeToWebPushNotifications = () => {
  const store = useStore();
  const [upsertWebPushSubscription] = useMutation(UPSERT_WEB_PUSH_SUBSCRIPTION);

  const subscribeToWebPushNotifications = useCallback(async () => {
    const vapidPublicKey = store.get(webPushVapidPublicKeyState.atom);

    if (
      !isDefined(vapidPublicKey) ||
      getBrowserNotificationPermission() !== 'granted'
    ) {
      return;
    }

    const { endpoint, keys } = (
      await getOrCreateBrowserWebPushSubscription(vapidPublicKey)
    ).toJSON();

    if (!isDefined(endpoint) || !isDefined(keys)) {
      return;
    }

    await upsertWebPushSubscription({
      variables: {
        input: {
          endpoint,
          browserPublicKey: keys.p256dh,
          browserAuthSecret: keys.auth,
          vapidPublicKey,
        },
      },
    });
  }, [store, upsertWebPushSubscription]);

  return { subscribeToWebPushNotifications };
};
