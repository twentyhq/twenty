import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

export type CoreAgentSettings = Pick<
  CoreAgentFormValues,
  'description' | 'prompt' | 'modelId' | 'modelConfiguration'
> & {
  triggers: unknown[];
};
