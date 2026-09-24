import { msg } from '@lingui/core/macro';

import { SettingsLogsFunctionCell } from '@/settings/log-explorer/components/SettingsLogsFunctionCell';
import { SettingsLogsLevelCell } from '@/settings/log-explorer/components/SettingsLogsLevelCell';
import { SettingsLogsMessageCell } from '@/settings/log-explorer/components/SettingsLogsMessageCell';
import { SettingsLogsShortIdCell } from '@/settings/log-explorer/components/SettingsLogsShortIdCell';
import { SETTINGS_LOGS_TIME_COLUMN } from '@/settings/log-explorer/constants/SettingsLogsTimeColumn';
import { type SettingsLogsColumn } from '@/settings/log-explorer/types/SettingsLogsColumn';

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
