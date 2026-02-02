import { isDefined } from 'twenty-shared/utils';

export const parseCommaSeparatedEmails = (
  value: string | undefined,
): string[] => {
  if (!isDefined(value)) {
    return [];
  }

  return value
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
};
