import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type TagColor } from 'twenty-ui/primitives/data-display';

import { type SettingsLogsSeverity } from '@/settings/log-explorer/types/SettingsLogsSeverity';

export const SETTINGS_LOGS_LEVELS: Partial<
  Record<
    string,
    {
      label: MessageDescriptor;
      color: TagColor;
      variant: 'soft' | 'outline';
      severity?: SettingsLogsSeverity;
    }
  >
> = {
  ERROR: {
    label: msg`Error`,
    color: 'red',
    variant: 'soft',
    severity: 'error',
  },
  WARN: {
    label: msg`Warning`,
    color: 'orange',
    variant: 'soft',
    severity: 'warning',
  },
  INFO: { label: msg`Info`, color: 'gray', variant: 'soft' },
  DEBUG: { label: msg`Debug`, color: 'transparent', variant: 'outline' },
};
