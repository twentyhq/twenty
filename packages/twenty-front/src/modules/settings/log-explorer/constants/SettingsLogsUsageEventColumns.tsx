import { msg } from '@lingui/core/macro';
import { Text } from 'twenty-ui/primitives/typography';

import { SettingsLogsMemberCell } from '@/settings/log-explorer/components/SettingsLogsMemberCell';
import { SETTINGS_LOGS_TIME_COLUMN } from '@/settings/log-explorer/constants/SettingsLogsTimeColumn';
import { type SettingsLogsColumn } from '@/settings/log-explorer/types/SettingsLogsColumn';

export const SETTINGS_LOGS_USAGE_EVENT_COLUMNS: SettingsLogsColumn[] = [
  SETTINGS_LOGS_TIME_COLUMN,
  {
    id: 'event',
    label: msg`Event`,
    gridTrack: '216px',
    renderCell: (entry) => <Text truncate>{entry.event}</Text>,
  },
  {
    id: 'member',
    label: msg`Member`,
    gridTrack: '200px',
    renderCell: (entry) => (
      <SettingsLogsMemberCell userWorkspaceId={entry.userId} />
    ),
  },
  {
    id: 'details',
    label: msg`Details`,
    gridTrack: 'minmax(320px, 1fr)',
    renderCell: (entry) => (
      <Text truncate>{JSON.stringify(entry.properties)}</Text>
    ),
  },
];
