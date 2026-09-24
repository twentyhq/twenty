import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type FindOneAgentQuery } from '~/generated-metadata/graphql';
import { type SettingsAiAgentFormValues } from '~/pages/settings/ai/validation-schemas/settingsAiAgentFormSchema';

export const getSettingsAgentInitialFormValues = (
  agent?: FindOneAgentQuery['findOneAgent'],
): SettingsAiAgentFormValues => {
  if (!isDefined(agent)) {
    return {
      name: '',
      label: '',
      description: '',
      icon: 'IconLego',
      modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
      role: null,
      prompt: '',
      isCustom: true,
      modelConfiguration: {},
      responseFormat: {
        // TODO: Keep text default until legacy text agents are migrated in production.
        type: 'text',
      },
      evaluationInputs: [],
    };
  }

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
