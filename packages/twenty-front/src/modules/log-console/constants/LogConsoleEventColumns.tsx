import { msg } from '@lingui/core/macro';
import { Text } from 'twenty-ui/primitives/typography';

import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_EVENT_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'event',
    label: msg`Event`,
    gridTrack: 'minmax(0, 216px)',
    renderCell: (entry) => <Text truncate>{entry.event}</Text>,
  },
  {
    id: 'member',
    label: msg`Member`,
    gridTrack: 'minmax(0, 200px)',
    renderCell: (entry) => <LogConsoleMemberCell userId={entry.userId} />,
  },
  {
    id: 'details',
    label: msg`Details`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => (
      <Text truncate>{JSON.stringify(entry.properties)}</Text>
    ),
    hiddenWhenPanelOpen: true,
    hiddenInDetails: true,
  },
];
