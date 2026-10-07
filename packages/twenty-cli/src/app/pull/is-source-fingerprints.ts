import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;

export const isSourceFingerprints = (
  value: unknown,
): value is Record<string, string> =>
  isPlainObject(value) &&
  Object.values(value).every(
    (fingerprint) =>
      isString(fingerprint) && SHA256_HEX_PATTERN.test(fingerprint),
  );
