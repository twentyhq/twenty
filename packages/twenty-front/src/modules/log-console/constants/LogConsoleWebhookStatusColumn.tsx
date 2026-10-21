import { msg, t } from '@lingui/core/macro';
import { Status } from 'twenty-ui/primitives/data-display';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { SettingsTableTagCell } from '@/settings/components/SettingsTableTagCell';

export const LOG_CONSOLE_WEBHOOK_STATUS_COLUMN: LogConsoleColumn = {
  id: 'status',
  label: msg`Status`,
  gridTrack: '120px',
  renderCell: (entry) => (
    <SettingsTableTagCell>
      <Status color={entry.properties?.success ? 'green' : 'red'}>
        {entry.properties?.status ?? t`Network error`}
      </Status>
    </SettingsTableTagCell>
  ),
};
