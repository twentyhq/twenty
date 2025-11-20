import { isDefined } from 'twenty-shared/utils';

type StepDefinition = {
  type: 'trigger' | 'action';
  definition: any;
};

export const getAgentIdFromStep = (
  stepDefinition: StepDefinition | undefined,
): string | undefined => {
  if (!isDefined(stepDefinition)) {
    return undefined;
  }

  if (stepDefinition.type === 'trigger') {
    return undefined;
  }

  const definition = stepDefinition.definition;
  if (!isDefined(definition)) {
    return undefined;
  }

  if (definition.type !== 'AI_AGENT') {
    return undefined;
  }

  if (
    !('settings' in definition) ||
    !isDefined(definition.settings) ||
    !('input' in definition.settings) ||
    !isDefined(definition.settings.input) ||
    !('agentId' in definition.settings.input)
  ) {
    return undefined;
  }

  return definition.settings.input.agentId;
};
