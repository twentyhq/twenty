import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';

import { type LogConsoleColumn } from '@/log-console/types/LogConsoleColumn';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';

export const LOG_CONSOLE_USAGE_OPERATION_COLUMN: LogConsoleColumn = {
  id: 'operation',
  label: msg`Operation`,
  gridTrack: 'minmax(0, 216px)',
  renderCell: (entry) => {
    const operationTypeLabel = getUsageOperationTypeLabel(
      entry.properties?.operationType,
    );

    return (
      <Text truncate>
        {isDefined(operationTypeLabel)
          ? t(operationTypeLabel)
          : entry.properties?.operationType}
      </Text>
    );
  },
};
