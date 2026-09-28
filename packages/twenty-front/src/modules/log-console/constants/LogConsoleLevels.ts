import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { type LogConsoleSeverity } from '@/log-console/types/LogConsoleSeverity';

export const LOG_CONSOLE_LEVELS: Partial<
  Record<
    string,
    {
      label: MessageDescriptor;
      color: ThemeColor;
      severity?: LogConsoleSeverity;
    }
  >
> = {
  ERROR: {
    label: msg`Error`,
    color: 'red',
    severity: 'error',
  },
  WARN: {
    label: msg`Warning`,
    color: 'orange',
    severity: 'warning',
  },
  INFO: { label: msg`Info`, color: 'blue' },
  DEBUG: { label: msg`Debug`, color: 'gray' },
};
