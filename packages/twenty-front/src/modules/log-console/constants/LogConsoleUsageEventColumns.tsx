import { msg } from '@lingui/core/macro';

import { LogConsoleCreditsCell } from '@/log-console/components/LogConsoleCreditsCell';
import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { LOG_CONSOLE_USAGE_OPERATION_COLUMN } from '@/log-console/constants/LogConsoleUsageOperationColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { formatNumber } from '~/utils/format/formatNumber';

export const LOG_CONSOLE_USAGE_EVENT_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  LOG_CONSOLE_USAGE_OPERATION_COLUMN,
  {
    id: 'spender',
    label: msg`Spender`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry, color) => (
      <LogConsoleMemberCell userWorkspaceId={entry.userId} color={color} />
    ),
  },
  {
    id: 'quantity',
    label: msg`Quantity`,
    gridTrack: '104px',
    renderCell: (entry) => formatNumber(entry.properties?.quantity),
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
