import { isDefined } from 'twenty-shared/utils';

import { encodeArrayBufferToBase64Url } from '@/web-push/utils/encodeArrayBufferToBase64Url';

export const getPushSubscriptionForKey = async ({
  registration,
  applicationServerKey,
}: {
  registration: ServiceWorkerRegistration;
  applicationServerKey: string;
}): Promise<PushSubscription> => {
  const existingSubscription = await registration.pushManager.getSubscription();

  if (isDefined(existingSubscription)) {
    const existingKey = existingSubscription.options.applicationServerKey;

    if (
      isDefined(existingKey) &&
      encodeArrayBufferToBase64Url(existingKey) === applicationServerKey
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
