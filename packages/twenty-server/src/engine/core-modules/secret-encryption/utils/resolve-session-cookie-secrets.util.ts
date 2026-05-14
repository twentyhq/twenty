import { createHash } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const SESSION_COOKIE_HMAC_PURPOSE = 'session-cookie';

// Pre-ENCRYPTION_KEY-rotation deployments signed session cookies with
// sha256(APP_SECRET || 'SESSION_STORE_SECRET'). The legacy slot lets cookies
// minted before this rollout keep verifying for the remainder of their
// 30-minute lifetime, after which they refresh under the new signature.
const buildLegacySessionSecret = (appSecret: string) =>
  createHash('sha256').update(`${appSecret}SESSION_STORE_SECRET`).digest('hex');

// TODO: drop the legacy APP_SECRET-derived slot once the 2.5 cross-upgrade
// window closes and any session cookie minted with the SHA-based secret has
// expired (maxAge: 30 minutes).
export const resolveSessionCookieSecretsOrThrow = ({
  twentyConfigService,
}: {
  twentyConfigService: Pick<TwentyConfigService, 'get'>;
}): string[] => {
  const encryptionKey = twentyConfigService.get('ENCRYPTION_KEY');
  const fallbackEncryptionKey = twentyConfigService.get(
    'FALLBACK_ENCRYPTION_KEY',
  );
  const appSecret = twentyConfigService.get('APP_SECRET');

  const rawPrimary = isNonEmptyString(encryptionKey)
    ? encryptionKey
    : appSecret;

  if (!isNonEmptyString(rawPrimary)) {
    throw new Error(
      'Cannot derive session cookie secret: set ENCRYPTION_KEY (or APP_SECRET for legacy deployments).',
    );
  }

  const secrets: string[] = [
    deriveInstanceHmacKey({
      rawKey: rawPrimary,
      purpose: SESSION_COOKIE_HMAC_PURPOSE,
    }).toString('hex'),
  ];

  if (isNonEmptyString(fallbackEncryptionKey)) {
    secrets.push(
      deriveInstanceHmacKey({
        rawKey: fallbackEncryptionKey,
        purpose: SESSION_COOKIE_HMAC_PURPOSE,
      }).toString('hex'),
    );
  }

  if (isNonEmptyString(appSecret)) {
    secrets.push(buildLegacySessionSecret(appSecret));
  }

  return secrets;
};
