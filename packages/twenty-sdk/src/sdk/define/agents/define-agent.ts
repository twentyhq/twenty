import { isBoolean, isNonEmptyString } from '@sniptt/guards';
import {
  AI_CHAT_ASSISTANT_AVATAR_COLORS,
  AI_CHAT_ASSISTANT_AVATAR_SHAPES,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import {
  AGENT_TRIGGER_EVENT_NAME_PATTERN,
  AGENT_TRIGGER_LIMITS,
  AGENT_TRIGGER_TYPES,
  type AgentTriggerManifest,
  type AgentManifest,
} from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { getDatabaseEventTriggerSettingsErrors } from '@/sdk/define/common/utils/get-database-event-trigger-settings-errors';
import { getRecordEventTriggerSettingsErrors } from '@/sdk/define/common/utils/get-record-event-trigger-settings-errors';

// Keyed by every ModelConfiguration key so a new capability fails to compile until listed
const MODEL_CAPABILITIES: Record<keyof ModelConfiguration, true> = {
  webSearch: true,
  twitterSearch: true,
};

const MODEL_CAPABILITY_NAMES = new Set(Object.keys(MODEL_CAPABILITIES));

// EVENT is stored as DATABASE_EVENT once its object and fields are resolved
const AGENT_TRIGGER_MANIFEST_TYPES: AgentTriggerManifest['type'][] = [
  'EVENT',
  ...AGENT_TRIGGER_TYPES,
];

const getAgentTriggerSettingsErrors = ({
  trigger,
  subject,
}: {
  trigger: AgentTriggerManifest;
  subject: string;
}): string[] => {
  if (trigger.type !== 'EVENT' && trigger.type !== 'DATABASE_EVENT') {
    return [];
  }

  if (!isPlainObject(trigger.settings)) {
    return [`${subject} must have settings`];
  }

  if (trigger.type === 'EVENT') {
    return getRecordEventTriggerSettingsErrors({
      settings: trigger.settings,
      subject,
      isObjectRequired: true,
    });
  }

  // TODO: remove with the legacy databaseEventTriggerSettings / DATABASE_EVENT manifest form
  return getDatabaseEventTriggerSettingsErrors({
    settings: trigger.settings,
    subject,
    eventNamePattern: AGENT_TRIGGER_EVENT_NAME_PATTERN,
    replacement: "an EVENT trigger with on: 'recordEvent'",
  });
};

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

  if (isDefined(config.isSystem) && !isBoolean(config.isSystem)) {
    errors.push(`Agent '${config.name}' isSystem must be a boolean`);
  }

  if (
    isDefined(config.avatarColor) &&
    !AI_CHAT_ASSISTANT_AVATAR_COLORS.includes(config.avatarColor)
  ) {
    errors.push(
      `Agent '${config.name}' avatarColor must be one of: ${AI_CHAT_ASSISTANT_AVATAR_COLORS.join(', ')}`,
    );
  }

  if (
    isDefined(config.avatarShape) &&
    !AI_CHAT_ASSISTANT_AVATAR_SHAPES.includes(config.avatarShape)
  ) {
    errors.push(
      `Agent '${config.name}' avatarShape must be one of: ${AI_CHAT_ASSISTANT_AVATAR_SHAPES.join(', ')}`,
    );
  }

  if (
    isDefined(config.modelConfiguration) &&
    !isPlainObject(config.modelConfiguration)
  ) {
    errors.push(`Agent '${config.name}' modelConfiguration must be an object`);
  }

  for (const [capability, capabilityConfiguration] of Object.entries(
    isPlainObject(config.modelConfiguration) ? config.modelConfiguration : {},
  )) {
    if (!MODEL_CAPABILITY_NAMES.has(capability)) {
      errors.push(
        `Agent '${config.name}' modelConfiguration.${capability} is not supported, use one of: ${[...MODEL_CAPABILITY_NAMES].join(', ')}`,
      );
      continue;
    }

    if (
      !isPlainObject(capabilityConfiguration) ||
      !isBoolean(capabilityConfiguration.enabled)
    ) {
      errors.push(
        `Agent '${config.name}' modelConfiguration.${capability}.enabled must be a boolean`,
      );
      continue;
    }

    if (
      isDefined(capabilityConfiguration.configuration) &&
      !isPlainObject(capabilityConfiguration.configuration)
    ) {
      errors.push(
        `Agent '${config.name}' modelConfiguration.${capability}.configuration must be an object`,
      );
    }
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

    if (!AGENT_TRIGGER_MANIFEST_TYPES.includes(trigger.type)) {
      errors.push(
        `Agent '${config.name}' trigger type must be one of: ${AGENT_TRIGGER_MANIFEST_TYPES.join(', ')}`,
      );
    }

    errors.push(
      ...getAgentTriggerSettingsErrors({
        trigger,
        subject: `Agent '${config.name}' trigger`,
      }),
    );

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
