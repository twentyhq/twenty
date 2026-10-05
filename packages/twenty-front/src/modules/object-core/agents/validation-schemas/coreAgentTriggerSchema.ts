import { CronExpressionParser } from 'cron-parser';
import { z } from 'zod';

const AGENT_TRIGGER_EVENT_NAME_PATTERN =
  /^[a-z][a-zA-Z0-9]*\.(created|updated|deleted|destroyed|restored|upserted)$/;

// Mirrors the server limit so autosave never sends instructions it would reject
const AGENT_TRIGGER_INSTRUCTIONS_MAX_LENGTH = 10_000;

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
  instructions: z
    .string()
    .max(AGENT_TRIGGER_INSTRUCTIONS_MAX_LENGTH)
    .nullable(),
};

export const coreAgentTriggerSchema = z.discriminatedUnion('type', [
  z.object({
    ...agentTriggerBaseShape,
    type: z.literal('DATABASE_EVENT'),
    settings: z
      .object({
        eventName: z.string().regex(AGENT_TRIGGER_EVENT_NAME_PATTERN),
        updatedFields: z.array(z.string().min(1)).optional(),
        batchMode: z.boolean().optional(),
      })
      .refine(
        ({ eventName, updatedFields }) =>
          updatedFields === undefined || eventName.endsWith('.updated'),
      ),
  }),
  z.object({
    ...agentTriggerBaseShape,
    type: z.literal('CRON'),
    settings: z.object({
      pattern: z.string().refine(isValidCronPattern),
    }),
  }),
]);
