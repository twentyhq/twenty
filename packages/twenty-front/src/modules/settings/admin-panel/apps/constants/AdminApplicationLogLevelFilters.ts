import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type AdminApplicationLogLevelFilter } from '@/settings/admin-panel/apps/types/AdminApplicationLogLevelFilter';

export const ADMIN_APPLICATION_LOG_LEVEL_FILTERS: {
  value: AdminApplicationLogLevelFilter;
  label: MessageDescriptor;
  levels?: string[];
}[] = [
  { value: 'all', label: msg`All levels` },
  { value: 'errors', label: msg`Errors`, levels: ['ERROR'] },
  {
    value: 'errorsAndWarnings',
    label: msg`Errors and warnings`,
    levels: ['ERROR', 'WARN'],
  },
];
