import { isNonEmptyString } from '@sniptt/guards';
import {
  AGENT_TRIGGER_EVENT_NAME_PATTERN,
  AGENT_TRIGGER_LIMITS,
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

  const triggers = config.triggers ?? [];

  if (triggers.length > AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT) {
    errors.push(
      `Agent '${config.name}' cannot have more than ${AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT} triggers`,
    );
  }

  const triggerIdentifiers = triggers.map(
    (trigger) => trigger.universalIdentifier,
  );

  if (new Set(triggerIdentifiers).size !== triggerIdentifiers.length) {
    errors.push(
      `Agent '${config.name}' trigger universalIdentifiers must be unique`,
    );
  }

  for (const trigger of triggers) {
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

    const eventName =
      trigger.type === 'DATABASE_EVENT' ? trigger.settings?.eventName : null;

    if (
      trigger.type === 'DATABASE_EVENT' &&
      (!isNonEmptyString(eventName) ||
        !AGENT_TRIGGER_EVENT_NAME_PATTERN.test(eventName))
    ) {
      errors.push(
        `Agent '${config.name}' trigger event name '${eventName}' must look like 'company.created'`,
      );
    }

    if (
      (trigger.instructions?.length ?? 0) >
      AGENT_TRIGGER_LIMITS.MAX_INSTRUCTIONS_LENGTH
    ) {
      errors.push(
        `Agent '${config.name}' trigger instructions cannot exceed ${AGENT_TRIGGER_LIMITS.MAX_INSTRUCTIONS_LENGTH} characters`,
      );
    }
  }

  return createValidationResult({ config, errors, warnings });
};
