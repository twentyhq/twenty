import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { getLogConsoleSecurityEvent } from '@/log-console/utils/getLogConsoleSecurityEvent';
import { SettingsTableTagCell } from '@/settings/components/SettingsTableTagCell';

export const LOG_CONSOLE_SECURITY_EVENT_COLUMN: LogConsoleColumn = {
  id: 'event',
  label: msg`Event`,
  gridTrack: 'minmax(160px, 216px)',
  renderCell: (entry) => {
    const securityEvent = getLogConsoleSecurityEvent(entry);

    return (
      <SettingsTableTagCell>
        {isDefined(securityEvent) && (
          <Status color={securityEvent.color}>{t(securityEvent.label)}</Status>
        )}
      </SettingsTableTagCell>
    );
  },
};
