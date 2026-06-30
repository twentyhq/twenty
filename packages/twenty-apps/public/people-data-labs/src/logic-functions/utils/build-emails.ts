import { isNonEmptyArray } from '@sniptt/guards';

import { toText } from 'src/logic-functions/utils/to-text';
import { type EmailsValue } from 'src/types/emails-value';
import { isDefined } from 'src/utils/is-defined';

export const buildEmails = (
  candidates: (string | null | undefined)[],
): EmailsValue | undefined => {
  const emails: string[] = [];
  const seenEmailKeys = new Set<string>();

  for (const candidate of candidates) {
    const email = toText(candidate);
    if (!isDefined(email)) {
      continue;
    }

    const emailKey = email.toLowerCase();
    if (!seenEmailKeys.has(emailKey)) {
      seenEmailKeys.add(emailKey);
      emails.push(email);
    }
  }

  if (!isNonEmptyArray(emails)) {
    return undefined;
  }

  return {
    primaryEmail: emails[0],
    additionalEmails: emails.length > 1 ? emails.slice(1) : null,
  };
};
