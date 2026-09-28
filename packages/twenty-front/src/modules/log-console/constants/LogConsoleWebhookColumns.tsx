import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { LogConsoleWebhookEndpointLink } from '@/log-console/components/LogConsoleWebhookEndpointLink';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { LOG_CONSOLE_WEBHOOK_STATUS_COLUMN } from '@/log-console/constants/LogConsoleWebhookStatusColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { SettingsTableTagCell } from '@/settings/components/SettingsTableTagCell';
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
      <SettingsTableTagCell>
        {isNonEmptyString(entry.properties?.url) && (
          <LogConsoleWebhookEndpointLink url={entry.properties.url} />
        )}
      </SettingsTableTagCell>
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
