import { isNonEmptyString } from '@sniptt/guards';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WebPushVapidKeyPair } from 'src/engine/core-modules/web-push/types/web-push-vapid-key-pair.type';
import { deriveWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/derive-web-push-vapid-key-pair.util';

export const getWebPushVapidKeyPairs = ({
  twentyConfigService,
}: {
  twentyConfigService: Pick<TwentyConfigService, 'get'>;
}): WebPushVapidKeyPair[] => {
  const publicKey = twentyConfigService.get('WEB_PUSH_VAPID_PUBLIC_KEY');
  const privateKey = twentyConfigService.get('WEB_PUSH_VAPID_PRIVATE_KEY');

  if (isNonEmptyString(publicKey) && isNonEmptyString(privateKey)) {
    return [{ publicKey, privateKey }];
  }

  const encryptionKey = twentyConfigService.get('ENCRYPTION_KEY');
  const fallbackEncryptionKey = twentyConfigService.get(
    'FALLBACK_ENCRYPTION_KEY',
  );
  const appSecret = twentyConfigService.get('APP_SECRET');

  const rawKeys = [
    isNonEmptyString(encryptionKey) ? encryptionKey : appSecret,
    fallbackEncryptionKey,
    appSecret,
  ].filter(isNonEmptyString);

  return [...new Set(rawKeys)].map((rawKey) =>
    deriveWebPushVapidKeyPair({ rawKey }),
  );
};
