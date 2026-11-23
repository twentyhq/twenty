import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { z } from 'zod';

const EMAIL_SCHEMA = z.string().trim().pipe(z.email());

export const getEmailRecipientsError = ({
  to,
  cc,
  bcc,
}: {
  to: string[];
  cc: string[];
  bcc: string[];
}): MessageDescriptor | null => {
  const allEmails = [...to, ...cc, ...bcc];
  const total = allEmails.length;

  if (total > MAX_EMAIL_RECIPIENTS) {
    return msg`Too many recipients: ${total}. Maximum allowed is ${MAX_EMAIL_RECIPIENTS}.`;
  }

  const invalidEmails = allEmails.filter(
    (email) => !EMAIL_SCHEMA.safeParse(email).success,
  );

  if (invalidEmails.length > 0) {
    const invalidEmailList = invalidEmails.join(', ');

    return msg`Invalid email addresses: ${invalidEmailList}`;
  }

  return null;
};
