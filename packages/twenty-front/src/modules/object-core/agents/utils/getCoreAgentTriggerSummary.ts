import { t } from '@lingui/core/macro';
import { type AgentTrigger } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { describeCronExpression } from '~/utils/cron-to-human/describeCronExpression';

export const getCoreAgentTriggerSummary = ({
  trigger,
  objectLabel,
}: {
  trigger: AgentTrigger;
  objectLabel?: string;
}): string => {
  const summary = (() => {
    if (trigger.type === 'CRON') {
      try {
        return describeCronExpression(trigger.settings.pattern, {
          use24HourTimeFormat: true,
        });
      } catch {
        return t`Invalid schedule`;
      }
    }

    const [objectName = '', action = ''] =
      trigger.settings.eventName.split('.');
    const labels: Record<string, string> = {
      created: t`Created`,
      updated: t`Updated`,
      upserted: t`Created or updated`,
      deleted: t`Deleted`,
      destroyed: t`Permanently deleted`,
      restored: t`Restored`,
    };
    const eventLabel = labels[action] ?? action;
    const recordLabel = objectLabel ?? objectName;
    const fields = trigger.settings.updatedFields;
    const event = `${recordLabel}: ${eventLabel}`;

    return isNonEmptyArray(fields) ? `${event} (${fields.join(', ')})` : event;
  })();

  return trigger.isActive ? summary : t`Paused: ${summary}`;
};
