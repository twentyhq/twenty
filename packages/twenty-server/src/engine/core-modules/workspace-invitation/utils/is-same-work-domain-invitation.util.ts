import { isNonEmptyString } from '@sniptt/guards';

import { getDomainFromEmail } from 'src/utils/get-domain-from-email';
import { isWorkEmail } from 'src/utils/is-work-email';

export const isSameWorkDomainInvitation = ({
  senderEmail,
  inviteeEmail,
}: {
  senderEmail: string;
  inviteeEmail: string;
}) => {
  const normalizedSenderEmail = senderEmail.toLowerCase();

  if (!isWorkEmail(normalizedSenderEmail)) {
    return false;
  }

  const senderDomain = getDomainFromEmail(normalizedSenderEmail);

  return (
    isNonEmptyString(senderDomain) &&
    getDomainFromEmail(inviteeEmail.toLowerCase()) === senderDomain
  );
};
