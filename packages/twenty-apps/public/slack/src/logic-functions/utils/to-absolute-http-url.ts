import { isDefined } from 'twenty-sdk/utils';

export const toAbsoluteHttpUrl = (
  value: string | undefined,
): string | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
};
