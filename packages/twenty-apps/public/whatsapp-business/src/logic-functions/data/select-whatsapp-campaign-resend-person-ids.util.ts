import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppCampaignRecipient } from 'src/logic-functions/types/whatsapp-campaign-recipient.type';

export const selectWhatsAppCampaignResendPersonIds = ({
  recipients,
  audience,
}: {
  recipients: Pick<WhatsAppCampaignRecipient, 'personId' | 'status' | 'hasReplied'>[];
  audience: 'FAILED' | 'NOT_REPLIED';
}): string[] => [
  ...new Set(
    recipients
      .filter(({ status, hasReplied }) => (audience === 'FAILED' ? status === 'FAILED' : !hasReplied))
      .map(({ personId }) => personId)
      .filter(isNonEmptyString),
  ),
];
