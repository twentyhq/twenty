import { isString } from '@sniptt/guards';

const DANGEROUS_URL_SCHEMES = ['javascript:', 'vbscript:', 'data:'];

export const hasDangerousUrlScheme = (value: unknown): boolean => {
  if (!isString(value)) {
    return false;
  }

  const normalizedValue = value
    .replace(/[\u0000-\u0020\u007F-\u009F]/g, '')
    .toLowerCase();

  return DANGEROUS_URL_SCHEMES.some((scheme) =>
    normalizedValue.startsWith(scheme),
  );
};
