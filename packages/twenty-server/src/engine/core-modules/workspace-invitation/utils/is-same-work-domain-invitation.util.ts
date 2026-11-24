import { isNonEmptyString } from '@sniptt/guards';
import { getDomainFromEmail, isWorkEmail } from 'twenty-shared/utils';

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
