import { msg } from '@lingui/core/macro';
import { getUrlHostnameOrThrow, isValidUrl } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { LOG_CONSOLE_WEBHOOK_STATUS_COLUMN } from '@/log-console/constants/LogConsoleWebhookStatusColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_WEBHOOK_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  LOG_CONSOLE_WEBHOOK_STATUS_COLUMN,
  {
    id: 'event',
    label: msg`Event`,
    gridTrack: 'minmax(0, 216px)',
    renderCell: (entry) => (
      <Text truncate style={{ fontFamily: themeCssVariables.code.font.family }}>
        {entry.properties?.eventName}
      </Text>
    ),
  },
  {
    id: 'url',
    label: msg`URL`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => {
      const url = entry.properties?.url ?? '';

      return (
        <Text truncate style={{ color: themeCssVariables.font.color.primary }}>
          {isValidUrl(url) ? getUrlHostnameOrThrow(url) : url}
        </Text>
      );
    },
    hiddenWhenPanelOpen: true,
    hiddenInDetails: true,
  },
  {
    id: 'error',
    label: msg`Error`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => (
      <Text truncate style={{ color: themeCssVariables.font.color.danger }}>
        {entry.properties?.error}
      </Text>
    ),
    hiddenWhenPanelOpen: true,
    hiddenInDetails: true,
  },
];
