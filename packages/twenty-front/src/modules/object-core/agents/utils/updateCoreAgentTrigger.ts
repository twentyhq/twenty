import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { isUndefined } from '@sniptt/guards';
import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const updateCoreAgentTrigger = ({
  triggers,
  triggerId,
  update,
}: {
  triggers: unknown[];
  triggerId: string;
  update: (trigger: AgentTrigger) => AgentTrigger;
}): unknown[] =>
  triggers.map((rawTrigger) => {
    const trigger = getCoreAgentEditableTrigger(rawTrigger);

    if (
      !isDefined(trigger) ||
      trigger.id !== triggerId ||
      !isPlainObject(rawTrigger)
    ) {
      return rawTrigger;
    }

    const nextTrigger = update(trigger);
    const settings = isPlainObject(rawTrigger.settings)
      ? rawTrigger.settings
      : {};

    return {
      ...rawTrigger,
      ...nextTrigger,
      settings: Object.fromEntries(
        Object.entries({ ...settings, ...nextTrigger.settings }).filter(
          ([, value]) => !isUndefined(value),
        ),
      ),
    };
  });
