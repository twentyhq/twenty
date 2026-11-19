import { Buffer } from 'buffer';
import { base64UrlEncode, isDefined } from 'twenty-shared/utils';

export const getOrCreateBrowserWebPushSubscription = async (
  vapidPublicKey: string,
): Promise<PushSubscription> => {
  const registration =
    await navigator.serviceWorker.register('/service-worker.js');
  const existingSubscription = await registration.pushManager.getSubscription();

  if (isDefined(existingSubscription)) {
    const existingKey = existingSubscription.options.applicationServerKey;

    if (
      isDefined(existingKey) &&
      base64UrlEncode(Buffer.from(existingKey)) === vapidPublicKey
    ) {
      return existingSubscription;
    }

    await existingSubscription.unsubscribe();
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  });
};
