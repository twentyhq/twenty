import { z } from 'zod';
import { hasSingleTemplateHeaderKind } from 'src/logic-functions/data/has-single-template-header-kind.util';
import { sendTemplateContentSchema } from 'src/logic-functions/data/send-template-content.schema';

export const sendTemplateMessageParamsSchema = sendTemplateContentSchema
  .extend({ to: z.string().min(1) })
  .refine(hasSingleTemplateHeaderKind, {
    message: 'A header takes either text parameters or media, not both',
    path: ['headerMedia'],
  });
