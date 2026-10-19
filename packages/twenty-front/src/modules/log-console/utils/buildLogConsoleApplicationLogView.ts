import { isDefined } from 'twenty-shared/utils';

import { type LogConsoleView } from '@/log-console/types/LogConsoleView';
import { EventLogFilterOperand } from '~/generated-metadata/graphql';

export const buildLogConsoleApplicationLogView = ({
  applicationId,
  logicFunctionId,
}: {
  applicationId?: string;
  logicFunctionId?: string;
}): LogConsoleView => ({
  sourceId: 'app-logs',
  filters: [
    ...(isDefined(applicationId)
      ? [
          {
            filterFieldId: 'app',
            operand: EventLogFilterOperand.IS,
            values: [applicationId],
          },
        ]
      : []),
    ...(isDefined(logicFunctionId)
      ? [
          {
            filterFieldId: 'function',
            operand: EventLogFilterOperand.IS,
            values: [logicFunctionId],
          },
        ]
      : []),
  ],
});
