import { msg } from '@lingui/core/macro';

import { SettingsLogsFunctionCell } from '@/log-console/components/SettingsLogsFunctionCell';
import { SettingsLogsLevelCell } from '@/log-console/components/SettingsLogsLevelCell';
import { SettingsLogsMessageCell } from '@/log-console/components/SettingsLogsMessageCell';
import { SettingsLogsShortIdCell } from '@/log-console/components/SettingsLogsShortIdCell';
import { SETTINGS_LOGS_TIME_COLUMN } from '@/log-console/constants/SettingsLogsTimeColumn';
import { type SettingsLogsColumn } from '@/log-console/types/SettingsLogsColumn';

export const SETTINGS_LOGS_APPLICATION_LOG_COLUMNS: SettingsLogsColumn[] = [
  SETTINGS_LOGS_TIME_COLUMN,
  {
    id: 'level',
    label: msg`Level`,
    gridTrack: '96px',
    renderCell: (entry) => (
      <SettingsLogsLevelCell level={entry.properties?.level} />
    ),
  },
  {
    id: 'function',
    label: msg`Function`,
    gridTrack: '232px',
    renderCell: (entry) => <SettingsLogsFunctionCell name={entry.event} />,
  },
  {
    id: 'message',
    label: msg`Message`,
    gridTrack: 'minmax(320px, 1fr)',
    renderCell: (entry) => (
      <SettingsLogsMessageCell message={entry.properties?.message ?? ''} />
    ),
  },
  {
    id: 'execution',
    label: msg`Execution`,
    gridTrack: '104px',
    renderCell: (entry) => (
      <SettingsLogsShortIdCell id={entry.properties?.executionId ?? ''} />
    ),
  },
];
