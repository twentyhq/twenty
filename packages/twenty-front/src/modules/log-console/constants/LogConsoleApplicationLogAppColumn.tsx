import { msg } from '@lingui/core/macro';

import { LogConsoleAppCell } from '@/log-console/components/LogConsoleAppCell';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_APPLICATION_LOG_APP_COLUMN: LogConsoleColumn = {
  id: 'app',
  label: msg`App`,
  gridTrack: 'minmax(140px, 166px)',
  renderCell: (entry) => (
    <LogConsoleAppCell applicationId={entry.properties?.applicationId} />
  ),
};
