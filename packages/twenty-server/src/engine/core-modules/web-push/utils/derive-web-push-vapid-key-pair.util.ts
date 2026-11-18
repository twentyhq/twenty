import { createECDH } from 'crypto';

import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { type WebPushVapidKeyPair } from 'src/engine/core-modules/web-push/types/web-push-vapid-key-pair.type';

const WEB_PUSH_VAPID_HMAC_PURPOSE = 'web-push-vapid';

export const deriveWebPushVapidKeyPair = ({
  rawKey,
}: {
  rawKey: string;
}): WebPushVapidKeyPair => {
  const privateKey = deriveInstanceHmacKey({
    rawKey,
    purpose: WEB_PUSH_VAPID_HMAC_PURPOSE,
  });
  const ecdh = createECDH('prime256v1');

  ecdh.setPrivateKey(privateKey);

  return {
    publicKey: ecdh.getPublicKey('base64url'),
    privateKey: privateKey.toString('base64url'),
  };
};
