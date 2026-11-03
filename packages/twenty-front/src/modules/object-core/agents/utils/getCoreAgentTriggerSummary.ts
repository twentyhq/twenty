import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';
import { type AgentTrigger } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { describeCronExpression } from '~/utils/cron-to-human/describeCronExpression';

export const getCoreAgentTriggerSummary = ({
  trigger,
  objectLabel,
  fields,
}: {
  trigger: AgentTrigger;
  objectLabel?: string;
  fields?: readonly Pick<FieldMetadataItem, 'name' | 'label'>[];
}): string => {
  const summary = (() => {
    if (trigger.type === 'CRON') {
      try {
        CronExpressionParser.parse(trigger.settings.pattern);
      } catch {
        return t`Invalid schedule`;
      }
      try {
        return describeCronExpression(trigger.settings.pattern, {
          use24HourTimeFormat: true,
        });
      } catch {
        return trigger.settings.pattern;
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
    const watchedFields = trigger.settings.updatedFields;
    const fieldLabels = new Map(
      fields?.map(({ name, label }) => [name, label]),
    );
    const event = `${recordLabel}: ${eventLabel}`;

    return isNonEmptyArray(watchedFields)
      ? `${event} (${watchedFields.map((name) => fieldLabels.get(name) ?? name).join(', ')})`
      : event;
  })();

  return trigger.isActive ? summary : t`Paused: ${summary}`;
};
