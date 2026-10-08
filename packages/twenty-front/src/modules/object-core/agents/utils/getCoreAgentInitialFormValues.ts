import { type FindOneAgentQuery } from '~/generated-metadata/graphql';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';

const parseAgentTriggers = (
  triggers: unknown[],
): CoreAgentFormValues['triggers'] =>
  triggers.flatMap((trigger) => {
    const parsedTrigger = coreAgentTriggerSchema.safeParse(trigger);

    return parsedTrigger.success ? [parsedTrigger.data] : [];
  });

export const getCoreAgentInitialFormValues = (
  agent: FindOneAgentQuery['findOneAgent'],
): CoreAgentFormValues => {
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
    triggers: parseAgentTriggers(agent.triggers ?? []),
  };
};
