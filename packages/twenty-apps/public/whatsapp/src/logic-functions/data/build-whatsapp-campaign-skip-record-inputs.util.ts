import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppCampaignSkipRecordReason } from 'src/logic-functions/types/whatsapp-campaign-skip-record-reason.type';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

const getSkippedRecipientName = (person: Pick<WhatsAppTemplateRecipientPerson, 'name'> | null) => {
  const personName = [person?.name?.firstName, person?.name?.lastName].filter(isNonEmptyString).join(' ');

  if (isNonEmptyString(personName)) {
    return personName;
  }

  return person === null ? 'Deleted person' : 'Unnamed person';
};

export const buildWhatsAppCampaignSkipRecordInputs = ({
  campaignId,
  skips,
}: {
  campaignId: string;
  skips: { person: Pick<WhatsAppTemplateRecipientPerson, 'id' | 'name'> | null; reason: WhatsAppCampaignSkipRecordReason }[];
}) =>
  skips.map(({ person, reason }) => ({
    campaignId,
    personId: person?.id ?? null,
    reason,
    recipientName: getSkippedRecipientName(person),
  }));
