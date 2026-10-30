import { type FindOneAgentQuery } from '~/generated-metadata/graphql';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

export const getCoreAgentInitialFormValues = (
  agent: FindOneAgentQuery['findOneAgent'],
): CoreAgentFormValues => {
  return {
    name: agent.name,
    label: agent.label,
    description: agent.description,
    icon: agent.icon || 'IconLego',
    modelId: agent.modelId,
    prompt: agent.prompt,
    isCustom: agent.isCustom,
    modelConfiguration: agent.modelConfiguration || {},
  };
};
