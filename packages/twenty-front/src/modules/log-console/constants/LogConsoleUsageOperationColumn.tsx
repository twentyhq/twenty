import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';

export const LOG_CONSOLE_USAGE_OPERATION_COLUMN: LogConsoleColumn = {
  id: 'operation',
  label: msg`Operation`,
  gridTrack: 'minmax(140px, 216px)',
  renderCell: (entry) => {
    const operationTypeLabel = getUsageOperationTypeLabel(
      entry.properties?.operationType,
    );

    return (
      <SettingsTableTextCell
        text={
          isDefined(operationTypeLabel)
            ? t(operationTypeLabel)
            : entry.properties?.operationType
        }
      />
    );
  },
};
