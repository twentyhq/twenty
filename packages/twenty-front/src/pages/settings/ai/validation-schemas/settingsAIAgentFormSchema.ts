import { z } from 'zod';
import { zodNonEmptyString } from '~/types/ZodNonEmptyString';

export const settingsAIAgentFormSchema = z.object({
  name: zodNonEmptyString,
  label: zodNonEmptyString,
  description: z.string().nullish(),
  icon: z.string().optional(),
  modelId: z.string().min(1, 'Model is required'),
  role: z.string().optional(),
  prompt: zodNonEmptyString,
  isCustom: z.boolean().default(true),
});

export type SettingsAIAgentFormValues = z.infer<
  typeof settingsAIAgentFormSchema
>;
