import { isNonEmptyString } from '@sniptt/guards';

const JWK_THUMBPRINT_REGEX = /^[A-Za-z0-9_-]+$/u;
const JWK_THUMBPRINT_MAX_LENGTH = 128;

export const isJwkThumbprint = (value: unknown): value is string => {
  return (
    isNonEmptyString(value) &&
    value.length <= JWK_THUMBPRINT_MAX_LENGTH &&
    JWK_THUMBPRINT_REGEX.test(value)
  );
};
