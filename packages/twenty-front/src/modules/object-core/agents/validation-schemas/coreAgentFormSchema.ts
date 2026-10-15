import { AGENT_TRIGGER_LIMITS } from 'twenty-shared/application';
import { t } from '@lingui/core/macro';
import { z } from 'zod';
import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';
import { zodNonEmptyString } from '~/types/ZodNonEmptyString';

export const coreAgentFormSchema = z.object({
  name: z.string().optional(),
  label: zodNonEmptyString,
  description: z.string().nullish(),
  icon: z.string().optional(),
  modelId: z.string().min(1, { error: () => t`Model is required` }),
  role: z.string().nullish(),
  prompt: zodNonEmptyString,
  isCustom: z.boolean().default(true),
  modelConfiguration: z
    .object({
      webSearch: z
        .object({
          enabled: z.boolean(),
          configuration: z.record(z.string(), z.unknown()).optional(),
        })
        .optional(),
      twitterSearch: z
        .object({
          enabled: z.boolean(),
          configuration: z.record(z.string(), z.unknown()).optional(),
        })
        .optional(),
    })
    .optional(),
  triggers: z
    .array(coreAgentTriggerSchema)
    .max(AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT)
    .default([]),
});

export type CoreAgentFormValues = z.infer<typeof coreAgentFormSchema>;
