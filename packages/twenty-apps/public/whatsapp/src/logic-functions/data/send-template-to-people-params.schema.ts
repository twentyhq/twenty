import { z } from 'zod';
import { hasSingleTemplateHeaderKind } from 'src/logic-functions/data/has-single-template-header-kind.util';
import { sendTemplateContentSchema } from 'src/logic-functions/data/send-template-content.schema';

const SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS = 200;

export const sendTemplateToPeopleParamsSchema = sendTemplateContentSchema
  .extend({
    // makes a retried request reuse its jobs instead of sending the template twice
    requestId: z.string().min(1).max(64),
    personIds: z.array(z.string().min(1)).min(1).max(SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS),
  })
  .refine(hasSingleTemplateHeaderKind, {
    message: 'A header takes either text parameters or media, not both',
    path: ['headerMedia'],
  });
