import { msg } from '@lingui/core/macro';
import { Text } from 'twenty-ui/primitives/typography';

import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { LOG_CONSOLE_WEBHOOK_STATUS_COLUMN } from '@/log-console/constants/LogConsoleWebhookStatusColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_WEBHOOK_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'event',
    label: msg`Event`,
    gridTrack: 'minmax(0, 186px)',
    renderCell: (entry) => <Text truncate>{entry.properties?.eventName}</Text>,
  },
  {
    id: 'endpoint',
    label: msg`Endpoint`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => <Text truncate>{entry.properties?.url}</Text>,
    hiddenWhenPanelOpen: true,
  },
  LOG_CONSOLE_WEBHOOK_STATUS_COLUMN,
  {
    id: 'error',
    label: msg`Error`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => (
      <Text truncate>{entry.properties?.error ?? '—'}</Text>
    ),
    hiddenWhenPanelOpen: true,
  },
];
