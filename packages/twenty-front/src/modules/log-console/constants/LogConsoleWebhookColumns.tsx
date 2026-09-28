import { msg } from '@lingui/core/macro';

import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { LOG_CONSOLE_WEBHOOK_STATUS_COLUMN } from '@/log-console/constants/LogConsoleWebhookStatusColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { SettingsTableLinkCell } from '@/settings/components/SettingsTableLinkCell';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';

export const LOG_CONSOLE_WEBHOOK_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'event',
    label: msg`Event`,
    gridTrack: 'minmax(0, 186px)',
    renderCell: (entry) => (
      <SettingsTableTextCell text={entry.properties?.eventName} />
    ),
  },
  {
    id: 'endpoint',
    label: msg`Endpoint`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => (
      <SettingsTableLinkCell url={entry.properties?.url} />
    ),
  },
  LOG_CONSOLE_WEBHOOK_STATUS_COLUMN,
  {
    id: 'error',
    label: msg`Error`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => (
      <SettingsTableTextCell text={entry.properties?.error ?? '—'} />
    ),
  },
];
