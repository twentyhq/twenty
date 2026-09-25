import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconApps,
  IconBrandTypescript,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';

import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { type LogConsoleFilterField } from '@/log-console/types/LogConsoleFilterField';

export const LOG_CONSOLE_APPLICATION_LOG_FILTER_FIELDS: LogConsoleFilterField[] =
  [
    {
      id: 'level',
      label: msg`Level`,
      Icon: IconAlertTriangle,
      serverField: 'level',
      getOptions: () =>
        Object.entries(LOG_CONSOLE_LEVELS).flatMap(([levelValue, level]) =>
          isDefined(level)
            ? [
                {
                  label: t(level.label),
                  values: [levelValue],
                  tag: (
                    <Tag color={level.color} variant={level.variant}>
                      {t(level.label)}
                    </Tag>
                  ),
                },
              ]
            : [],
        ),
    },
    {
      id: 'function',
      label: msg`Function`,
      Icon: IconBrandTypescript,
      serverField: 'logicFunctionId',
      getOptions: ({ logicFunctions }) =>
        logicFunctions.map((logicFunction) => ({
          label: logicFunction.name,
          values: [logicFunction.id],
          startIcon: <IconBrandTypescript />,
        })),
    },
    {
      id: 'app',
      label: msg`App`,
      Icon: IconApps,
      serverField: 'applicationId',
      getOptions: ({ applications }) =>
        applications.map((application) => ({
          label: application.name,
          values: [application.id],
          startIcon: <IconApps />,
        })),
    },
  ];
