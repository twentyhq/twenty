import { Buffer } from 'buffer';
import { base64UrlEncode, isDefined } from 'twenty-shared/utils';

export const getOrCreateBrowserWebPushSubscription = async (
  vapidPublicKey: string,
): Promise<PushSubscription> => {
  await navigator.serviceWorker.register('/service-worker.js');

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  const existingVapidPublicKey =
    existingSubscription?.options.applicationServerKey;

  if (
    isDefined(existingSubscription) &&
    isDefined(existingVapidPublicKey) &&
    base64UrlEncode(Buffer.from(existingVapidPublicKey)) === vapidPublicKey
  ) {
    return existingSubscription;
  }

  await existingSubscription?.unsubscribe();

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  });
};
