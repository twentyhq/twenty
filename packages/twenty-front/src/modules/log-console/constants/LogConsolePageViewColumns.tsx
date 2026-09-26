import { msg } from '@lingui/core/macro';
import { Text } from 'twenty-ui/primitives/typography';

import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

const SESSION_ID_DISPLAYED_LENGTH = 8;

export const LOG_CONSOLE_PAGE_VIEW_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'member',
    label: msg`Member`,
    gridTrack: 'minmax(0, 200px)',
    renderCell: (entry, color) => (
      <LogConsoleMemberCell userId={entry.userId} color={color} />
    ),
  },
  {
    id: 'page',
    label: msg`Page`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => <Text truncate>{entry.properties?.pathname}</Text>,
  },
  {
    id: 'session',
    label: msg`Session`,
    gridTrack: '104px',
    renderCell: (entry) =>
      entry.properties?.sessionId?.slice(0, SESSION_ID_DISPLAYED_LENGTH),
    hiddenWhenPanelOpen: true,
  },
];
