import { msg } from '@lingui/core/macro';

import { SettingsLogsTimeCell } from '@/log-console/components/SettingsLogsTimeCell';
import { type SettingsLogsColumn } from '@/log-console/types/SettingsLogsColumn';

export const SETTINGS_LOGS_TIME_COLUMN: SettingsLogsColumn = {
  id: 'time',
  label: msg`Time`,
  gridTrack: '208px',
  renderCell: (entry) => <SettingsLogsTimeCell timestamp={entry.timestamp} />,
};
