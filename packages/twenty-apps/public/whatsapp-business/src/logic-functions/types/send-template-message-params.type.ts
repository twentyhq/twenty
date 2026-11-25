import { type z } from 'zod';
import { type sendTemplateMessageParamsSchema } from 'src/logic-functions/data/send-template-message-params.schema';

type SendTemplateMessageParams = z.infer<typeof sendTemplateMessageParamsSchema>;

export type TemplateParameterInput = SendTemplateMessageParams['parameters'][number];
export type TemplateHeaderMediaInput = NonNullable<SendTemplateMessageParams['headerMedia']>;
export type TemplateButtonParameterInput = SendTemplateMessageParams['buttonParameters'][number];
