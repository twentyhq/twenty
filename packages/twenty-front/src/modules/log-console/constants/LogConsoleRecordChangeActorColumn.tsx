import { msg } from '@lingui/core/macro';

import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { getLogConsoleRecordChangeActor } from '@/log-console/utils/getLogConsoleRecordChangeActor';

export const LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN: LogConsoleColumn = {
  id: 'actor',
  label: msg`Actor`,
  gridTrack: 'minmax(0, 166px)',
  renderCell: (entry, color) => (
    <LogConsoleMemberCell
      actor={getLogConsoleRecordChangeActor(entry)}
      userId={entry.userId}
      color={color}
    />
  ),
  hiddenWhenPanelOpen: true,
};
