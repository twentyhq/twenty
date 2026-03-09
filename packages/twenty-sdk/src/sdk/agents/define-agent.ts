import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type AgentManifest } from 'twenty-shared/application';

export const defineAgent: DefineEntity<AgentManifest> = (config) => {
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

  return createValidationResult({ config, errors });
};
