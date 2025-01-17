import { SelectOption } from '@/ui/input/components/Select';

import { DatabaseTriggerName } from '@/workflow/workflow-trigger/constants/DatabaseTriggerName';

export const DATABASE_TRIGGER_EVENTS: Array<SelectOption<string>> = [
  {
    label: DatabaseTriggerName.RECORD_IS_CREATED,
    value: 'created',
  },
  {
    label: DatabaseTriggerName.RECORD_IS_UPDATED,
    value: 'updated',
  },
  {
    label: DatabaseTriggerName.RECORD_IS_DELETED,
    value: 'deleted',
  },
];
