import { t } from '@lingui/core/macro';
import { z } from 'zod';
import { zodNonEmptyString } from '~/types/ZodNonEmptyString';

export const coreAgentFormSchema = z.object({
  name: z.string().optional(),
  label: zodNonEmptyString,
  description: z.string().nullish(),
  icon: z.string().optional(),
  modelId: z.string().min(1, { error: () => t`Model is required` }),
  prompt: zodNonEmptyString,
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
});

export type CoreAgentFormValues = z.infer<typeof coreAgentFormSchema>;
