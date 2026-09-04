import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';

type GetSoleEnvelopeRecipientArgs = Pick<
  EmailingDomainEmailContent,
  'to' | 'cc' | 'bcc'
>;

export const getSoleEnvelopeRecipient = ({
  to,
  cc,
  bcc,
}: GetSoleEnvelopeRecipientArgs): string | null => {
  const recipients = [...to, ...(cc ?? []), ...(bcc ?? [])];

  return recipients.length === 1 ? recipients[0] : null;
};
