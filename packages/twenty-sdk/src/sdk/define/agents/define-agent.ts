import { isNonEmptyString } from '@sniptt/guards';
import {
  AGENT_TRIGGER_TYPES,
  type AgentManifest,
} from 'twenty-shared/application';
import { validate as uuidValidate } from 'uuid';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

export const defineAgent: DefineEntity<AgentManifest> = (config) => {
  const errors: string[] = [];
  const warnings: string[] = [];

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

  if (!config.responseFormat) {
    warnings.push(
      `Agent '${config.name}' has no responseFormat, it will default to { type: 'text' }. Set it explicitly to control the agent's output shape.`,
    );
  }

  if (
    isNonEmptyString(config.roleUniversalIdentifier) &&
    !uuidValidate(config.roleUniversalIdentifier)
  ) {
    errors.push(
      `Agent '${config.name}' roleUniversalIdentifier must be a valid UUID`,
    );
  }

  for (const trigger of config.triggers ?? []) {
    if (!uuidValidate(trigger.universalIdentifier)) {
      errors.push(
        `Agent '${config.name}' trigger universalIdentifier must be a valid UUID`,
      );
    }

    if (!AGENT_TRIGGER_TYPES.includes(trigger.type)) {
      errors.push(
        `Agent '${config.name}' trigger type must be one of: ${AGENT_TRIGGER_TYPES.join(', ')}`,
      );
    }
  }

  return createValidationResult({ config, errors, warnings });
};
