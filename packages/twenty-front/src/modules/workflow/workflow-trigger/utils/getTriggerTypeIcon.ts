import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';

export const getTriggerTypeIcon = ({
  type,
  databaseEvent,
}: {
  type: string;
  databaseEvent: string | null | undefined;
}): string | undefined => {
  if (type === 'DATABASE_EVENT') {
    return DATABASE_TRIGGER_TYPES.find(
      (databaseTriggerType) => databaseTriggerType.event === databaseEvent,
    )?.icon;
  }

  return OTHER_TRIGGER_TYPES.find(
    (otherTriggerType) => otherTriggerType.type === type,
  )?.icon;
};
