import { msg } from '@lingui/core/macro';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { LOG_CONSOLE_SECURITY_EVENT_COLUMN } from '@/log-console/constants/LogConsoleSecurityEventColumn';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_SECURITY_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  LOG_CONSOLE_SECURITY_EVENT_COLUMN,
  {
    id: 'actor',
    label: msg`Actor`,
    gridTrack: 'minmax(0, 200px)',
    renderCell: (entry) => (
      <LogConsoleMemberCell
        userId={entry.userId}
        isImpersonator={entry.event === 'Impersonation'}
      />
    ),
  },
  {
    id: 'details',
    label: msg`Details`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => (
      <Text truncate style={{ color: themeCssVariables.font.color.tertiary }}>
        {entry.properties?.message}
      </Text>
    ),
    hiddenWhenPanelOpen: true,
    hiddenInDetails: true,
  },
];
