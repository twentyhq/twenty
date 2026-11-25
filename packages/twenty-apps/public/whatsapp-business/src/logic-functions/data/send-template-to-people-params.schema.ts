import { z } from 'zod';
import { WHATSAPP_TEMPLATE_PERSON_FIELDS } from 'src/constants/whatsapp-template-person-fields.constant';
import { hasSingleTemplateHeaderKind } from 'src/logic-functions/data/has-single-template-header-kind.util';
import { sendTemplateContentSchema } from 'src/logic-functions/data/send-template-content.schema';

const personalizableParameterSchema = z
  .object({
    name: z.string().min(1).optional(),
    value: z.string().min(1).optional(),
    personField: z.enum(WHATSAPP_TEMPLATE_PERSON_FIELDS).optional(),
  })
  .refine(({ value, personField }) => (value === undefined) !== (personField === undefined), {
    message: 'Each parameter takes either a value or a person field',
  });

export const sendTemplateToPeopleParamsSchema = sendTemplateContentSchema
  .extend({
    // makes a retried request reuse its jobs instead of sending the template twice
    requestId: z.string().min(1).max(64),
    recipients: z.union([
      z.object({ personIds: z.array(z.string().min(1)).min(1).max(200) }),
      z.object({ filter: z.record(z.string(), z.unknown()) }),
    ]),
    parameters: z.array(personalizableParameterSchema).default([]),
    headerParameters: z.array(personalizableParameterSchema).default([]),
    // counts the recipients without sending, so the form can confirm a large send
    isDryRun: z.boolean().default(false),
    sendAt: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(hasSingleTemplateHeaderKind, {
    message: 'A header takes either text parameters or media, not both',
    path: ['headerMedia'],
  });
