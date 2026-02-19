import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type AgentConfig } from '@/sdk/agents/agent-config';

export const defineAgent: DefineEntity<AgentConfig> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('Agent must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('Agent must have a name');
  }

  if (!config.label) {
    errors.push('Agent must have a label');
  }

  if (!config.prompt) {
    errors.push('Agent must have a prompt');
  }

  if (config.responseFormat && config.responseFormat.type === 'json') {
    if (!config.responseFormat.schema) {
      errors.push('Agent JSON response format must have a schema');
    }
  }

  return createValidationResult({ config, errors });
};
