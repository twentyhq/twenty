import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';
import { t } from '@lingui/core/macro';
import { isObject } from '@sniptt/guards';
import { AGENT_TRIGGER_LIMITS } from 'twenty-shared/application';

export const getCoreAgentTriggersValidationError = (
  triggers: unknown[],
): string | null => {
  if (triggers.length > AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT) {
    return t`An agent can have at most 20 triggers.`;
  }

  for (const trigger of triggers) {
    const isSupportedTrigger =
      isObject(trigger) &&
      'type' in trigger &&
      (trigger.type === 'CRON' || trigger.type === 'DATABASE_EVENT');

    if (
      isSupportedTrigger &&
      !coreAgentTriggerSchema.safeParse(trigger).success
    ) {
      return t`Fix the invalid trigger before saving settings.`;
    }
  }

  return null;
};
