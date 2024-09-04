import { SelectOption } from '@/ui/input/components/Select';

export const OBJECT_EVENT_TRIGGERS: Array<SelectOption<string>> = [
  {
    label: 'Created',
    value: 'created',
  },
  {
    label: 'Updated',
    value: 'updated',
  },
  {
    label: 'Deleted',
    value: 'deleted',
  },
];
