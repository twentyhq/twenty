import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

export type CoreAgentDraft = CoreAgentFormValues & Pick<CoreAgent, 'triggers'>;
