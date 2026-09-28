import { msg } from '@lingui/core/macro';

import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';

const SESSION_ID_DISPLAYED_LENGTH = 8;

export const LOG_CONSOLE_PAGE_VIEW_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'member',
    label: msg`Member`,
    gridTrack: 'minmax(140px, 200px)',
    renderCell: (entry) => <LogConsoleMemberCell userId={entry.userId} />,
  },
  {
    id: 'page',
    label: msg`Page`,
    gridTrack: 'minmax(200px, 1fr)',
    renderCell: (entry) => (
      <SettingsTableTextCell text={entry.properties?.pathname} />
    ),
  },
  {
    id: 'session',
    label: msg`Session`,
    gridTrack: '104px',
    renderCell: (entry) => (
      <SettingsTableTextCell
        text={entry.properties?.sessionId?.slice(
          0,
          SESSION_ID_DISPLAYED_LENGTH,
        )}
      />
    ),
  },
];
