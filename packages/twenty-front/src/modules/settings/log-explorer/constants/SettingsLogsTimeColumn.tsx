import { msg } from '@lingui/core/macro';

import { SettingsLogsTimeCell } from '@/settings/log-explorer/components/SettingsLogsTimeCell';
import { type SettingsLogsColumn } from '@/settings/log-explorer/types/SettingsLogsColumn';

export const SETTINGS_LOGS_TIME_COLUMN: SettingsLogsColumn = {
  id: 'time',
  label: msg`Time`,
  gridTrack: '208px',
  renderCell: (entry) => <SettingsLogsTimeCell timestamp={entry.timestamp} />,
};
