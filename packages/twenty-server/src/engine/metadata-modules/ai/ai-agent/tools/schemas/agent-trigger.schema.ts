import {
  AGENT_TRIGGER_EVENT_NAME_PATTERN,
  AGENT_TRIGGER_LIMITS,
} from 'twenty-shared/application';
import { z } from 'zod';

const agentTriggerBaseSchema = z.object({
  id: z
    .uuid()
    .optional()
    .describe(
      'Id of an existing trigger, as returned by list_agents. Pass it to keep that trigger when updating; omit it for a new trigger.',
    ),
  isActive: z
    .boolean()
    .optional()
    .describe('Whether the trigger starts runs. Defaults to true.'),
  instructions: z
    .string()
    .max(AGENT_TRIGGER_LIMITS.MAX_INSTRUCTIONS_LENGTH)
    .nullable()
    .optional()
    .describe(
      "What the agent should do when this trigger fires, on top of its prompt (e.g. 'Post a summary of the new deal in a note on the company').",
    ),
});

const databaseEventTriggerSchema = agentTriggerBaseSchema.extend({
  type: z.literal('DATABASE_EVENT'),
  settings: z.object({
    eventName: z
      .string()
      .regex(AGENT_TRIGGER_EVENT_NAME_PATTERN)
      .describe(
        "'<objectNameSingular>.<action>' where action is created, updated, deleted, destroyed, restored or upserted (e.g. 'opportunity.created'). Wildcards are not allowed.",
      ),
    updatedFields: z
      .array(z.string().min(1))
      .optional()
      .describe(
        "Only for '.updated' and '.upserted' events: field names that must change for the trigger to fire. A relation to one record is named by its id field (e.g. 'companyId').",
      ),
    condition: z
      .string()
      .optional()
      .describe(
        "Rule expression the record must meet for the trigger to fire, using the object's field names (e.g. \"stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'\"). previous.<field> reads the value before an update. A relation to one record reads its target's fields, as in a validation rule (company.id, company.employees > 100); previous.<field> only covers the record's own fields.",
      ),
    batchMode: z
      .boolean()
      .optional()
      .describe(
        'When true, events fired close together are grouped into a single run.',
      ),
  }),
});

const cronTriggerSchema = agentTriggerBaseSchema.extend({
  type: z.literal('CRON'),
  settings: z.object({
    pattern: z
      .string()
      .min(1)
      .describe(
        "Standard 5-field cron pattern (e.g. '0 9 * * 1' for every Monday at 9:00).",
      ),
  }),
});

export const agentTriggersSchema = z
  .array(
    z.discriminatedUnion('type', [
      databaseEventTriggerSchema,
      cronTriggerSchema,
    ]),
  )
  .max(AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT)
  .describe(
    'What wakes the agent up on its own. DATABASE_EVENT runs it when records change, with the changed records as input. CRON runs it on a schedule.',
  );

export type AgentTriggerInput = z.infer<typeof agentTriggersSchema>[number];
