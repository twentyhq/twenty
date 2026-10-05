import { CronExpressionParser } from 'cron-parser';
import { z } from 'zod';

const AGENT_TRIGGER_EVENT_NAME_PATTERN =
  /^[a-z][a-zA-Z0-9]*\.(created|updated|deleted|destroyed|restored|upserted)$/;

const isValidCronPattern = (pattern: string): boolean => {
  try {
    CronExpressionParser.parse(pattern);

    return true;
  } catch {
    return false;
  }
};

const agentTriggerBaseShape = {
  id: z.uuid(),
  isActive: z.boolean(),
  instructions: z.string().nullable(),
};

export const coreAgentTriggerSchema = z.discriminatedUnion('type', [
  z.object({
    ...agentTriggerBaseShape,
    type: z.literal('DATABASE_EVENT'),
    settings: z.object({
      eventName: z.string().regex(AGENT_TRIGGER_EVENT_NAME_PATTERN),
      updatedFields: z.array(z.string()).optional(),
      batchMode: z.boolean().optional(),
    }),
  }),
  z.object({
    ...agentTriggerBaseShape,
    type: z.literal('CRON'),
    settings: z.object({
      pattern: z.string().refine(isValidCronPattern),
    }),
  }),
]);
