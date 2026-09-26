import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

import { LogConsoleChangesCell } from '@/log-console/components/LogConsoleChangesCell';
import { LogConsoleRecordCell } from '@/log-console/components/LogConsoleRecordCell';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN } from '@/log-console/constants/LogConsoleRecordChangeActorColumn';
import { LOG_CONSOLE_TIME_COLUMN } from '@/log-console/constants/LogConsoleTimeColumn';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_RECORD_CHANGE_COLUMNS: LogConsoleColumn[] = [
  LOG_CONSOLE_TIME_COLUMN,
  {
    id: 'action',
    label: msg`Action`,
    gridTrack: 'minmax(0, 176px)',
    renderCell: (entry) => {
      const action = LOG_CONSOLE_RECORD_ACTIONS[entry.event];

      return isDefined(action) ? (
        <Status color={action.color}>{t(action.label)}</Status>
      ) : null;
    },
  },
  {
    id: 'record',
    label: msg`Record`,
    gridTrack: 'minmax(0, 216px)',
    renderCell: (entry, color) => (
      <LogConsoleRecordCell entry={entry} color={color} />
    ),
  },
  {
    id: 'changes',
    label: msg`Changes`,
    gridTrack: 'minmax(200px, 1fr)',
    renderCell: (entry) => <LogConsoleChangesCell entry={entry} />,
    hiddenWhenPanelOpen: true,
  },
  LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN,
];
