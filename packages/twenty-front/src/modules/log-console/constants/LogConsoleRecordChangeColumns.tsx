import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';

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
    gridTrack: 'minmax(0, 184px)',
    renderCell: (entry) => {
      const action = LOG_CONSOLE_RECORD_ACTIONS[entry.event];

      return isDefined(action) ? (
        <Tag color={action.color} startIcon={<action.Icon />}>
          {t(action.label)}
        </Tag>
      ) : null;
    },
  },
  {
    id: 'record',
    label: msg`Record`,
    gridTrack: 'minmax(0, 200px)',
    renderCell: (entry) => <LogConsoleRecordCell entry={entry} />,
  },
  {
    id: 'changes',
    label: msg`Changes`,
    gridTrack: 'minmax(200px, 1fr)',
    renderCell: (entry) => <LogConsoleChangesCell entry={entry} />,
    hiddenWhenPanelOpen: true,
    hiddenInDetails: true,
  },
  LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN,
];
