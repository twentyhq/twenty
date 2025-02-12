import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';

export const getTriggerIcon = (
  trigger:
    | {
        type: 'MANUAL';
      }
    | {
        type: 'CRON';
      }
    | {
        type: 'DATABASE_EVENT';
        eventName: string;
      },
): string | undefined => {
  if (trigger.type === 'DATABASE_EVENT') {
    return DATABASE_TRIGGER_TYPES.find(
      (type) => type.event === trigger.eventName,
    )?.icon;
  }

  return OTHER_TRIGGER_TYPES.find((item) => item.type === trigger.type)?.icon;
};
