import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ServerRouteSigningKey } from 'src/engine/core-modules/server-route-trigger/types/server-route-signing-key.type';

const toRsaSigningKey = (key: unknown): ServerRouteSigningKey | undefined => {
  if (
    !isPlainObject(key) ||
    key.kty !== 'RSA' ||
    !isNonEmptyString(key.kid) ||
    !isNonEmptyString(key.n) ||
    !isNonEmptyString(key.e) ||
    (isDefined(key.use) && key.use !== 'sig')
  ) {
    return undefined;
  }

  return {
    kid: key.kid,
    kty: 'RSA',
    n: key.n,
    e: key.e,
    endorsements:
      isArray(key.endorsements) && key.endorsements.every(isString)
        ? key.endorsements
        : undefined,
  };
};

export const parseServerRouteSigningKeys = (
  jwksResponseBody: unknown,
): ServerRouteSigningKey[] => {
  if (!isPlainObject(jwksResponseBody) || !isArray(jwksResponseBody.keys)) {
    return [];
  }

  return jwksResponseBody.keys.map(toRsaSigningKey).filter(isDefined);
};
