import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';

export const LOG_CONSOLE_WEBHOOK_STATUS_COLUMN: LogConsoleColumn = {
  id: 'status',
  label: msg`Status`,
  gridTrack: '128px',
  renderCell: (entry) => {
    const status = entry.properties?.status;
    const isClientError = isDefined(status) && status >= 400 && status < 500;

    return (
      <Status
        color={
          entry.properties?.success === true
            ? 'green'
            : isClientError
              ? 'orange'
              : 'red'
        }
        style={{ flexShrink: 0 }}
      >
        {status ?? t`Network error`}
      </Status>
    );
  },
  hiddenInDetails: true,
};
