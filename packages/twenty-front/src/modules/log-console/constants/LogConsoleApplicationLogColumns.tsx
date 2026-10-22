import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { LOG_CONSOLE_APPLICATION_LOG_APP_COLUMN } from '@/log-console/constants/LogConsoleApplicationLogAppColumn';
import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { getLogConsoleApplicationLogEventIcon } from '@/log-console/utils/getLogConsoleApplicationLogEventIcon';
import { getApplicationLogFunctionOrEventLabel } from '@/settings/application-monitoring/utils/getApplicationLogFunctionOrEventLabel';
import { SettingsTableTagCell } from '@/settings/components/SettingsTableTagCell';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';

export const LOG_CONSOLE_APPLICATION_LOG_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'level',
    label: msg`Level`,
    gridTrack: '96px',
    renderCell: (entry) => {
      const level = LOG_CONSOLE_LEVELS[entry.properties?.level];

      return (
        <SettingsTableTagCell>
          {isDefined(level) && (
            <Status color={level.color}>{t(level.label)}</Status>
          )}
        </SettingsTableTagCell>
      );
    },
  },
  {
    id: 'function',
    label: msg`Function`,
    gridTrack: '216px',
    renderCell: (entry) => {
      const EventIcon = getLogConsoleApplicationLogEventIcon(entry.event);

      return (
        <SettingsTableTextCell
          startElement={
            <EventIcon
              size={14}
              stroke={themeCssVariables.icon.stroke.sm}
              color={themeCssVariables.font.color.tertiary}
            />
          }
          text={getApplicationLogFunctionOrEventLabel({
            logicFunctionName: entry.event,
            source: entry.properties?.source ?? '',
          })}
        />
      );
    },
  },
  {
    id: 'message',
    label: msg`Message`,
    gridTrack: 'minmax(200px, 1fr)',
    renderCell: (entry) => {
      const [firstLine] = (entry.properties?.message ?? '').split('\n');

      return <SettingsTableTextCell text={firstLine} />;
    },
  },
  LOG_CONSOLE_APPLICATION_LOG_APP_COLUMN,
];
