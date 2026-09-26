import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBrandTypescript } from 'twenty-ui/icon';
import { Chip, Status } from 'twenty-ui/primitives/data-display';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

const EXECUTION_ID_DISPLAYED_LENGTH = 8;

export const LOG_CONSOLE_APPLICATION_LOG_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'level',
    label: msg`Level`,
    gridTrack: '96px',
    renderCell: (entry) => {
      const level = LOG_CONSOLE_LEVELS[entry.properties?.level];

      return isDefined(level) ? (
        <Status color={level.color}>{t(level.label)}</Status>
      ) : null;
    },
  },
  {
    id: 'function',
    label: msg`Function`,
    gridTrack: '216px',
    renderCell: (entry, color) => (
      <Chip
        color={color}
        startElement={
          <IconBrandTypescript
            size={14}
            stroke={themeCssVariables.icon.stroke.sm}
            color={themeCssVariables.font.color.tertiary}
          />
        }
        style={{ paddingInlineStart: 0 }}
      >
        {entry.event}
      </Chip>
    ),
    hiddenWhenPanelOpen: true,
  },
  {
    id: 'message',
    label: msg`Message`,
    gridTrack: 'minmax(0, 1fr)',
    renderCell: (entry) => {
      const [firstLine] = (entry.properties?.message ?? '').split('\n');

      return <Text truncate>{firstLine}</Text>;
    },
    hiddenInDetails: true,
  },
  {
    id: 'execution',
    label: msg`Execution`,
    gridTrack: '88px',
    renderCell: (entry) =>
      entry.properties?.executionId?.slice(0, EXECUTION_ID_DISPLAYED_LENGTH),
    hiddenWhenPanelOpen: true,
    hiddenInDetails: true,
  },
];
