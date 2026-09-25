import { msg, plural, t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAddressBook,
  IconEye,
  IconGauge,
  IconTerminal,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';

import { LogConsoleRecordCell } from '@/log-console/components/LogConsoleRecordCell';
import { LogConsoleRecordChangeDetail } from '@/log-console/components/LogConsoleRecordChangeDetail';
import { LOG_CONSOLE_ACTOR_TYPE_LABELS } from '@/log-console/constants/LogConsoleActorTypeLabels';
import { LOG_CONSOLE_APPLICATION_LOG_COLUMNS } from '@/log-console/constants/LogConsoleApplicationLogColumns';
import { LOG_CONSOLE_EVENT_COLUMNS } from '@/log-console/constants/LogConsoleEventColumns';
import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN } from '@/log-console/constants/LogConsoleRecordChangeActorColumn';
import { LOG_CONSOLE_RECORD_CHANGE_COLUMNS } from '@/log-console/constants/LogConsoleRecordChangeColumns';
import { LOG_CONSOLE_USAGE_EVENT_COLUMNS } from '@/log-console/constants/LogConsoleUsageEventColumns';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { getLogConsoleRecordChangeActor } from '@/log-console/utils/getLogConsoleRecordChangeActor';
import { EventLogTable } from '~/generated-metadata/graphql';

export const LOG_CONSOLE_SOURCES: LogConsoleSource[] = [
  {
    id: 'record-changes',
    label: msg`Record changes`,
    entryLabel: msg`Record change`,
    Icon: IconAddressBook,
    table: EventLogTable.OBJECT_EVENT,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_RECORD_CHANGE_COLUMNS,
    idFields: [
      { label: msg`Record ID`, getId: (entry) => entry.recordId },
      { label: msg`User ID`, getId: (entry) => entry.userId },
    ],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} change`,
        other: `${formattedCount} changes`,
      }),
    renderDetailTitle: (entry) => {
      const action = LOG_CONSOLE_RECORD_ACTIONS[entry.event];

      return (
        <>
          {isDefined(action) && (
            <Tag color={action.color} startIcon={<action.Icon />}>
              {t(action.label)}
            </Tag>
          )}
          <LogConsoleRecordCell entry={entry} />
        </>
      );
    },
    renderDetailSubtitle: (entry) => {
      const actorTypeLabel =
        LOG_CONSOLE_ACTOR_TYPE_LABELS[
          getLogConsoleRecordChangeActor(entry)?.source ?? 'MANUAL'
        ];

      return (
        <>
          <Trans>
            by {LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN.renderCell(entry)}
          </Trans>
          {isDefined(actorTypeLabel) && `· ${t(actorTypeLabel)}`}
        </>
      );
    },
    renderDetailContent: (entry) => (
      <LogConsoleRecordChangeDetail entry={entry} />
    ),
  },
  {
    id: 'app-logs',
    label: msg`App logs`,
    entryLabel: msg`App log`,
    Icon: IconTerminal,
    table: EventLogTable.APPLICATION_LOG,
    requiresAuditLogs: false,
    columns: LOG_CONSOLE_APPLICATION_LOG_COLUMNS,
    idFields: [
      {
        label: msg`Execution ID`,
        getId: (entry) => entry.properties?.executionId,
      },
      {
        label: msg`Function ID`,
        getId: (entry) => entry.properties?.logicFunctionId,
      },
      {
        label: msg`App ID`,
        getId: (entry) => entry.properties?.applicationId,
      },
    ],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} log`,
        other: `${formattedCount} logs`,
      }),
    getSeverity: (entry) =>
      LOG_CONSOLE_LEVELS[entry.properties?.level]?.severity,
  },
  {
    id: 'page-views',
    label: msg`Page views`,
    entryLabel: msg`Page view`,
    Icon: IconEye,
    table: EventLogTable.PAGEVIEW,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_EVENT_COLUMNS,
    idFields: [
      { label: msg`User ID`, getId: (entry) => entry.userId },
      {
        label: msg`Session ID`,
        getId: (entry) => entry.properties?.sessionId,
      },
    ],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} page view`,
        other: `${formattedCount} page views`,
      }),
  },
  {
    id: 'usage',
    label: msg`Usage`,
    entryLabel: msg`Usage event`,
    Icon: IconGauge,
    table: EventLogTable.USAGE_EVENT,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_USAGE_EVENT_COLUMNS,
    idFields: [
      { label: msg`User workspace ID`, getId: (entry) => entry.userId },
    ],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} usage event`,
        other: `${formattedCount} usage events`,
      }),
  },
];
