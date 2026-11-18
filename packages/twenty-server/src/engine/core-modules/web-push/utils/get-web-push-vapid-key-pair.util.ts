import { createECDH } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const getWebPushVapidKeyPair = ({
  twentyConfigService,
}: {
  twentyConfigService: Pick<TwentyConfigService, 'get'>;
}): { publicKey: string; privateKey: string } => {
  const encryptionKey = twentyConfigService.get('ENCRYPTION_KEY');
  const privateKey = deriveInstanceHmacKey({
    rawKey: isNonEmptyString(encryptionKey)
      ? encryptionKey
      : twentyConfigService.get('APP_SECRET'),
    purpose: 'web-push-vapid',
  });
  const ecdh = createECDH('prime256v1');

  ecdh.setPrivateKey(privateKey);

  return {
    publicKey: ecdh.getPublicKey('base64url'),
    privateKey: privateKey.toString('base64url'),
  };
};
