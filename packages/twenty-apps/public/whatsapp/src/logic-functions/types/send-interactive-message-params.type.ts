import { type z } from 'zod';
import { type sendInteractiveMessageParamsSchema } from 'src/logic-functions/data/send-interactive-message-params.schema';

export type SendInteractiveMessageParams = z.infer<typeof sendInteractiveMessageParamsSchema>;
