import { msg } from '@lingui/core/macro';

export const CORE_AGENT_ADDITIONAL_RECORD_TRIGGER_EVENTS = [
  {
    event: 'destroyed',
    label: msg`Record is permanently deleted`,
    icon: 'IconTrashX',
  },
  { event: 'restored', label: msg`Record is restored`, icon: 'IconRestore' },
];
