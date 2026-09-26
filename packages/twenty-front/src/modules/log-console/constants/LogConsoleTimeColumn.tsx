import { msg } from '@lingui/core/macro';

import { LogConsoleTimeCell } from '@/log-console/components/LogConsoleTimeCell';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_TIME_COLUMN: LogConsoleColumn = {
  id: 'time',
  label: msg`Time`,
  gridTrack: '192px',
  renderCell: (entry) => <LogConsoleTimeCell timestamp={entry.timestamp} />,
  hiddenInDetails: true,
};
