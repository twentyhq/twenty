import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';

export const countDeliveredRecipients = ({
  to,
  cc,
  bcc,
}: EmailingDomainSendEmailResult['deliveredRecipients']): number =>
  to.length + cc.length + bcc.length;
