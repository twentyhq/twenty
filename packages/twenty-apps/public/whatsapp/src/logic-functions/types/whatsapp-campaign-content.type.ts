import { type z } from 'zod';
import { type sendTemplateToPeopleParamsSchema } from 'src/logic-functions/data/send-template-to-people-params.schema';

// what a campaign sends to each person, stored on the campaign so it can be sent again
export type WhatsAppCampaignContent = Omit<
  z.infer<typeof sendTemplateToPeopleParamsSchema>,
  'requestId' | 'recipients' | 'isDryRun' | 'sendAt'
>;
