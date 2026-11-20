import { type z } from 'zod';
import { type sendTemplateToPeopleParamsSchema } from 'src/logic-functions/data/send-template-to-people-params.schema';
import { type WhatsAppCampaignContent } from 'src/logic-functions/types/whatsapp-campaign-content.type';

// separates how a send is run from what it sends, which is stored on the campaign
export const splitSendTemplateToPeopleParams = ({
  requestId,
  recipients,
  isDryRun,
  sendAt,
  ...content
}: z.infer<typeof sendTemplateToPeopleParamsSchema>): {
  requestId: string;
  recipients: z.infer<typeof sendTemplateToPeopleParamsSchema>['recipients'];
  isDryRun: boolean;
  sendAt?: string;
  content: WhatsAppCampaignContent;
} => ({ requestId, recipients, isDryRun, sendAt, content });
