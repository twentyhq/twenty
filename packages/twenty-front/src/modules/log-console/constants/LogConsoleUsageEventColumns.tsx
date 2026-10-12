import { msg } from '@lingui/core/macro';

import { LogConsoleCreditsCell } from '@/log-console/components/LogConsoleCreditsCell';
import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { LOG_CONSOLE_USAGE_OPERATION_COLUMN } from '@/log-console/constants/LogConsoleUsageOperationColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';
import { formatNumber } from '@/localization/utils/formatNumber';

export const LOG_CONSOLE_USAGE_EVENT_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  LOG_CONSOLE_USAGE_OPERATION_COLUMN,
  {
    id: 'spender',
    label: msg`Spender`,
    gridTrack: 'minmax(140px, 1fr)',
    renderCell: (entry) => (
      <LogConsoleMemberCell userWorkspaceId={entry.userId} />
    ),
  },
  {
    id: 'quantity',
    label: msg`Quantity`,
    gridTrack: '104px',
    renderCell: (entry) => (
      <SettingsTableTextCell
        align="right"
        text={formatNumber(entry.properties?.quantity)}
      />
    ),
    align: 'right',
  },
  {
    id: 'usage',
    label: msg`Usage`,
    gridTrack: '120px',
    renderCell: (entry) => (
      <LogConsoleCreditsCell
        creditsUsedMicro={entry.properties?.creditsUsedMicro}
      />
    ),
    align: 'right',
  },
];
