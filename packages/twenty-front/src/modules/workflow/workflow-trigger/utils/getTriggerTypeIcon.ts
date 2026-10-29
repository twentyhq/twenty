import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';

export const getTriggerTypeIcon = ({
  type,
  databaseEvent,
}: {
  type: string;
  databaseEvent: string | null | undefined;
}): string | undefined =>
  type === 'DATABASE_EVENT'
    ? DATABASE_TRIGGER_TYPES.find(
        (databaseTriggerType) => databaseTriggerType.event === databaseEvent,
      )?.icon
    : OTHER_TRIGGER_TYPES.find(
        (otherTriggerType) => otherTriggerType.type === type,
      )?.icon;
