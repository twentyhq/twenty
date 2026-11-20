import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppCampaignSkipRecordReason } from 'src/logic-functions/types/whatsapp-campaign-skip-record-reason.type';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

export const buildWhatsAppCampaignSkipRecordInputs = ({
  campaignId,
  skips,
}: {
  campaignId: string;
  skips: { person: Pick<WhatsAppTemplateRecipientPerson, 'id' | 'name'> | null; reason: WhatsAppCampaignSkipRecordReason }[];
}) =>
  skips.map(({ person, reason }) => {
    const personName = [person?.name?.firstName, person?.name?.lastName].filter(isNonEmptyString).join(' ');

    return {
      campaignId,
      personId: person?.id ?? null,
      reason,
      recipientName: isNonEmptyString(personName) ? personName : person === null ? 'Deleted person' : 'Unnamed person',
    };
  });
