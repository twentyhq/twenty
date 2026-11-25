import { isDefined } from 'twenty-sdk/utils';
import { getPersonWhatsAppRecipient } from 'src/logic-functions/data/get-person-whatsapp-recipient.util';
import { resolvePersonTemplateParameters } from 'src/logic-functions/data/resolve-person-template-parameters.util';
import { type TemplateParameterInput } from 'src/logic-functions/types/send-template-message-params.type';
import { type WhatsAppCampaignContent } from 'src/logic-functions/types/whatsapp-campaign-content.type';
import { type WhatsAppCampaignSkipReason } from 'src/logic-functions/types/whatsapp-campaign-skip-reason.type';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

// decides whether and how one person receives a campaign, from their current record
export const resolveWhatsAppCampaignRecipient = ({
  person,
  templateCategory,
  content,
}: {
  person: WhatsAppTemplateRecipientPerson;
  templateCategory: string | null;
  content: Pick<WhatsAppCampaignContent, 'parameters' | 'headerParameters'>;
}):
  | { to: string; parameters: TemplateParameterInput[]; headerParameters: TemplateParameterInput[] }
  | { skipReason: WhatsAppCampaignSkipReason } => {
  const to = getPersonWhatsAppRecipient(person);

  if (!isDefined(to)) {
    return { skipReason: 'NO_WHATSAPP_NUMBER' };
  }

  if (templateCategory === 'MARKETING' && person.whatsAppMarketingOptOut === true) {
    return { skipReason: 'MARKETING_OPT_OUT' };
  }

  const parameters = resolvePersonTemplateParameters({ parameters: content.parameters, person });
  const headerParameters = resolvePersonTemplateParameters({ parameters: content.headerParameters, person });

  if (!isDefined(parameters) || !isDefined(headerParameters)) {
    return { skipReason: 'MISSING_PERSONALIZED_VALUE' };
  }

  return { to, parameters, headerParameters };
};
