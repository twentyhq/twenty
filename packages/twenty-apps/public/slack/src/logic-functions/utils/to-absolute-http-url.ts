import { isDefined } from 'twenty-sdk/utils';

export const toAbsoluteHttpUrl = (
  value: string | undefined,
): string | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  // a colon followed by digits is a port, not a scheme (acme.dev:8080)
  const hasScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(value);
  const candidate = hasScheme ? value : `https://${value}`;

  try {
    const url = new URL(candidate);

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
};
