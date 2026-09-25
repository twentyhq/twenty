import { msg, plural, t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  getUrlHostnameOrThrow,
  isDefined,
  isValidUrl,
} from 'twenty-shared/utils';
import {
  IconAddressBook,
  IconArrowUpRight,
  IconEye,
  IconGauge,
  IconKey,
  IconTerminal,
  IconWebhook,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';

import { LogConsoleRecordCell } from '@/log-console/components/LogConsoleRecordCell';
import { LogConsoleRecordChangeDetail } from '@/log-console/components/LogConsoleRecordChangeDetail';
import { LOG_CONSOLE_ACTOR_TYPE_LABELS } from '@/log-console/constants/LogConsoleActorTypeLabels';
import { LOG_CONSOLE_APPLICATION_LOG_COLUMNS } from '@/log-console/constants/LogConsoleApplicationLogColumns';
import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { LOG_CONSOLE_PAGE_VIEW_COLUMNS } from '@/log-console/constants/LogConsolePageViewColumns';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN } from '@/log-console/constants/LogConsoleRecordChangeActorColumn';
import { LOG_CONSOLE_RECORD_CHANGE_COLUMNS } from '@/log-console/constants/LogConsoleRecordChangeColumns';
import { LOG_CONSOLE_SECURITY_COLUMNS } from '@/log-console/constants/LogConsoleSecurityColumns';
import { LOG_CONSOLE_SECURITY_EVENT_COLUMN } from '@/log-console/constants/LogConsoleSecurityEventColumn';
import { LOG_CONSOLE_USAGE_EVENT_COLUMNS } from '@/log-console/constants/LogConsoleUsageEventColumns';
import { LOG_CONSOLE_USAGE_OPERATION_COLUMN } from '@/log-console/constants/LogConsoleUsageOperationColumn';
import { LOG_CONSOLE_WEBHOOK_COLUMNS } from '@/log-console/constants/LogConsoleWebhookColumns';
import { LOG_CONSOLE_WEBHOOK_STATUS_COLUMN } from '@/log-console/constants/LogConsoleWebhookStatusColumn';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { getLogConsoleRecordChangeActor } from '@/log-console/utils/getLogConsoleRecordChangeActor';
import { getLogConsoleSecurityEvent } from '@/log-console/utils/getLogConsoleSecurityEvent';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import {
  EventLogFilterOperand,
  EventLogTable,
} from '~/generated-metadata/graphql';

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
    id: 'security',
    label: msg`Security`,
    entryLabel: msg`Security event`,
    Icon: IconKey,
    table: EventLogTable.WORKSPACE_EVENT,
    fieldFilters: [
      {
        field: 'event',
        operand: EventLogFilterOperand.IS,
        values: [
          'AuthSession',
          'Impersonation',
          'ServerAdminAccessChanged',
          'User Signup',
          'Custom Domain Activated',
          'Custom Domain Deactivated',
        ],
      },
    ],
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_SECURITY_COLUMNS,
    idFields: [{ label: msg`User ID`, getId: (entry) => entry.userId }],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} event`,
        other: `${formattedCount} events`,
      }),
    getSeverity: (entry) => getLogConsoleSecurityEvent(entry)?.severity,
    renderDetailTitle: LOG_CONSOLE_SECURITY_EVENT_COLUMN.renderCell,
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
    id: 'webhooks',
    label: msg`Webhooks`,
    entryLabel: msg`Webhook delivery`,
    Icon: IconWebhook,
    table: EventLogTable.WORKSPACE_EVENT,
    fieldFilters: [
      {
        field: 'event',
        operand: EventLogFilterOperand.IS,
        values: ['Webhook Response'],
      },
    ],
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_WEBHOOK_COLUMNS,
    detailFields: [
      {
        label: msg`Result`,
        renderCell: (entry) =>
          entry.properties?.success === true ? (
            <Tag color="green">{t`Succeeded`}</Tag>
          ) : (
            <Tag color="red">{t`Failed`}</Tag>
          ),
      },
      {
        label: msg`HTTP status`,
        renderCell: (entry) => entry.properties?.status,
      },
    ],
    idFields: [
      { label: msg`Endpoint URL`, getId: (entry) => entry.properties?.url },
      { label: msg`Webhook ID`, getId: (entry) => entry.properties?.webhookId },
    ],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} delivery`,
        other: `${formattedCount} deliveries`,
      }),
    getSeverity: (entry) =>
      entry.properties?.success === true ? undefined : 'error',
    renderDetailTitle: (entry) => {
      const url = entry.properties?.url ?? '';

      return (
        <>
          {LOG_CONSOLE_WEBHOOK_STATUS_COLUMN.renderCell(entry)}
          {`${entry.properties?.eventName} → ${isValidUrl(url) ? getUrlHostnameOrThrow(url) : url}`}
        </>
      );
    },
    renderDetailContent: (entry) => (
      <NavigationButton
        startIcon={<IconArrowUpRight />}
        to={getSettingsPath(SettingsPath.WebhookDetail, {
          webhookId: entry.properties?.webhookId,
        })}
        style={{ alignSelf: 'flex-start' }}
      >
        {t`Open webhook settings`}
      </NavigationButton>
    ),
  },
  {
    id: 'page-views',
    label: msg`Page views`,
    entryLabel: msg`Page view`,
    Icon: IconEye,
    table: EventLogTable.PAGEVIEW,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_PAGE_VIEW_COLUMNS,
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
    renderDetailTitle: (entry) => entry.properties?.pathname,
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
    renderDetailTitle: LOG_CONSOLE_USAGE_OPERATION_COLUMN.renderCell,
  },
];
