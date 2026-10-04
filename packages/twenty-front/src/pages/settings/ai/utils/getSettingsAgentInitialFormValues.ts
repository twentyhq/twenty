import { type FindOneAgentQuery } from '~/generated-metadata/graphql';
import { type SettingsAiAgentFormValues } from '~/pages/settings/ai/validation-schemas/settingsAiAgentFormSchema';

export const getSettingsAgentInitialFormValues = (
  agent: FindOneAgentQuery['findOneAgent'],
): SettingsAiAgentFormValues => {
  return {
    name: agent.name,
    label: agent.label,
    description: agent.description,
    icon: agent.icon || 'IconLego',
    modelId: agent.modelId,
    role: agent.roleId,
    prompt: agent.prompt,
    isCustom: agent.isCustom,
    modelConfiguration: agent.modelConfiguration || {},
    // TODO: Fallback can be removed once all text response format agents are migrated.
    responseFormat: agent.responseFormat || { type: 'text' },
    evaluationInputs: agent.evaluationInputs ?? [],
  };
};
