import { isNonEmptyString } from '@sniptt/guards';
import { WHATSAPP_MESSAGE_STATUSES } from 'src/constants/whatsapp-message-statuses.constant';

type WhatsAppMessageStatus = (typeof WHATSAPP_MESSAGE_STATUSES)[number];

// Meta can deliver "read" before "delivered", so a status only ever moves forward
export const getNextWhatsAppMessageStatus = ({
  currentStatus,
  reportedStatus,
}: {
  currentStatus: string | null | undefined;
  reportedStatus: WhatsAppMessageStatus;
}): string | undefined => {
  const currentRank = isNonEmptyString(currentStatus)
    ? WHATSAPP_MESSAGE_STATUSES.findIndex((status) => status === currentStatus.toLowerCase())
    : -1;

  return WHATSAPP_MESSAGE_STATUSES.indexOf(reportedStatus) > currentRank
    ? reportedStatus.toUpperCase()
    : undefined;
};
