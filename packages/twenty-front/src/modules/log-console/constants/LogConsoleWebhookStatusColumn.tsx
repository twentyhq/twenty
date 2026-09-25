import { msg, t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/primitives/data-display';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_WEBHOOK_STATUS_COLUMN: LogConsoleColumn = {
  id: 'status',
  label: msg`Status`,
  gridTrack: '120px',
  renderCell: (entry) => (
    <Tag
      color={entry.properties?.success === true ? 'green' : 'red'}
      style={{ flexShrink: 0 }}
    >
      {entry.properties?.status ?? t`Network error`}
    </Tag>
  ),
};
