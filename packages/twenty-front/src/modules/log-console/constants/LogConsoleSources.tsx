import { msg, plural, t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  getUrlHostnameOrThrow,
  isDefined,
  isValidUrl,
} from 'twenty-shared/utils';
import {
  IconAddressBook,
  IconAlertTriangle,
  IconArrowUpRight,
  IconBox,
  IconBrandTypescript,
  IconClock,
  IconCoins,
  IconEye,
  IconGauge,
  IconHistory,
  IconKey,
  IconLink,
  IconStatusChange,
  IconSum,
  IconTerminal,
  IconUsers,
  IconWebhook,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';

import { LogConsoleCreditsCell } from '@/log-console/components/LogConsoleCreditsCell';
import { LogConsoleMemberCell } from '@/log-console/components/LogConsoleMemberCell';
import { LogConsoleRecordChangeDetail } from '@/log-console/components/LogConsoleRecordChangeDetail';
import { LOG_CONSOLE_ACTOR_FILTER_FIELD } from '@/log-console/constants/LogConsoleActorFilterField';
import { LOG_CONSOLE_APPLICATION_LOG_COLUMNS } from '@/log-console/constants/LogConsoleApplicationLogColumns';
import { LOG_CONSOLE_APPLICATION_LOG_FILTER_FIELDS } from '@/log-console/constants/LogConsoleApplicationLogFilterFields';
import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { LOG_CONSOLE_PAGE_VIEW_COLUMNS } from '@/log-console/constants/LogConsolePageViewColumns';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN } from '@/log-console/constants/LogConsoleRecordChangeActorColumn';
import { LOG_CONSOLE_RECORD_CHANGE_COLUMNS } from '@/log-console/constants/LogConsoleRecordChangeColumns';
import { LOG_CONSOLE_RECORD_CHANGE_FILTER_FIELDS } from '@/log-console/constants/LogConsoleRecordChangeFilterFields';
import { LOG_CONSOLE_SECURITY_COLUMNS } from '@/log-console/constants/LogConsoleSecurityColumns';
import { LOG_CONSOLE_SECURITY_FILTER_FIELDS } from '@/log-console/constants/LogConsoleSecurityFilterFields';
import { LOG_CONSOLE_USAGE_EVENT_COLUMNS } from '@/log-console/constants/LogConsoleUsageEventColumns';
import { LOG_CONSOLE_WEBHOOK_COLUMNS } from '@/log-console/constants/LogConsoleWebhookColumns';
import { type LogConsoleDetailField } from '@/log-console/types/LogConsoleDetailField';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { getLogConsoleRecordLabel } from '@/log-console/utils/getLogConsoleRecordLabel';
import { getLogConsoleSecurityEvent } from '@/log-console/utils/getLogConsoleSecurityEvent';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import {
  EventLogFilterOperand,
  EventLogTable,
} from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';

const TIME_DETAIL_FIELD: LogConsoleDetailField = {
  label: msg`Time`,
  Icon: IconClock,
  renderValue: (_entry, { formattedTimestamp }) => formattedTimestamp,
};

export const LOG_CONSOLE_SOURCES: LogConsoleSource[] = [
  {
    id: 'record-changes',
    label: msg`Record changes`,
    Icon: IconAddressBook,
    table: EventLogTable.OBJECT_EVENT,
    filterFields: LOG_CONSOLE_RECORD_CHANGE_FILTER_FIELDS,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_RECORD_CHANGE_COLUMNS,
    detailFields: [
      {
        label: msg`Action`,
        Icon: IconHistory,
        renderValue: (entry) => {
          const action = LOG_CONSOLE_RECORD_ACTIONS[entry.event];

          return isDefined(action) ? (
            <Tag color={action.color}>{t(action.label)}</Tag>
          ) : null;
        },
      },
      TIME_DETAIL_FIELD,
      {
        label: msg`Actor`,
        Icon: IconUsers,
        renderValue: (entry) =>
          LOG_CONSOLE_RECORD_CHANGE_ACTOR_COLUMN.renderCell(entry),
      },
      {
        label: msg`Object`,
        Icon: IconBox,
        renderValue: (_entry, { objectMetadataItem }) =>
          objectMetadataItem?.labelPlural,
      },
    ],
    idFields: [
      { label: msg`Record ID`, getId: (entry) => entry.recordId },
      { label: msg`User ID`, getId: (entry) => entry.userId },
    ],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} change`,
        other: `${formattedCount} changes`,
      }),
    getDetailTitle: (entry, { objectMetadataItem }) =>
      getLogConsoleRecordLabel({ entry, objectMetadataItem }),
    renderDetailContent: (entry) => (
      <LogConsoleRecordChangeDetail entry={entry} />
    ),
  },
  {
    id: 'security',
    label: msg`Security`,
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
    filterFields: LOG_CONSOLE_SECURITY_FILTER_FIELDS,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_SECURITY_COLUMNS,
    detailFields: [
      {
        label: msg`Event`,
        Icon: IconHistory,
        renderValue: (entry) => {
          const securityEvent = getLogConsoleSecurityEvent(entry);

          return isDefined(securityEvent) ? (
            <Tag color={securityEvent.color}>{t(securityEvent.label)}</Tag>
          ) : null;
        },
      },
      TIME_DETAIL_FIELD,
      {
        label: msg`Actor`,
        Icon: IconUsers,
        renderValue: (entry) => (
          <LogConsoleMemberCell
            userId={entry.userId}
            isImpersonator={entry.event === 'Impersonation'}
          />
        ),
      },
    ],
    idFields: [{ label: msg`User ID`, getId: (entry) => entry.userId }],
    searchPlaceholder: msg`Search events`,
    getSeverity: (entry) => getLogConsoleSecurityEvent(entry)?.severity,
    getDetailTitle: (entry) => {
      const securityEvent = getLogConsoleSecurityEvent(entry);

      return isDefined(securityEvent) ? t(securityEvent.label) : entry.event;
    },
  },
  {
    id: 'app-logs',
    label: msg`App logs`,
    Icon: IconTerminal,
    DetailIcon: IconBrandTypescript,
    table: EventLogTable.APPLICATION_LOG,
    filterFields: LOG_CONSOLE_APPLICATION_LOG_FILTER_FIELDS,
    requiresAuditLogs: false,
    columns: LOG_CONSOLE_APPLICATION_LOG_COLUMNS,
    detailFields: [
      {
        label: msg`Level`,
        Icon: IconAlertTriangle,
        renderValue: (entry) => {
          const level = LOG_CONSOLE_LEVELS[entry.properties?.level];

          return isDefined(level) ? (
            <Tag color={level.color}>{t(level.label)}</Tag>
          ) : null;
        },
      },
      TIME_DETAIL_FIELD,
    ],
    idFields: [
      {
        label: msg`Execution`,
        Icon: IconTerminal,
        getId: (entry) => entry.properties?.executionId,
      },
    ],
    searchPlaceholder: msg`Search logs`,
    getSeverity: (entry) =>
      LOG_CONSOLE_LEVELS[entry.properties?.level]?.severity,
    getDetailTitle: (entry) => entry.event,
  },
  {
    id: 'webhooks',
    label: msg`Webhooks`,
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
        label: msg`Status`,
        Icon: IconStatusChange,
        renderValue: (entry) => (
          <Tag color={entry.properties?.success === true ? 'green' : 'red'}>
            {entry.properties?.status ?? t`Network error`}
          </Tag>
        ),
      },
      TIME_DETAIL_FIELD,
      {
        label: msg`Event`,
        Icon: IconWebhook,
        renderValue: (entry) => entry.properties?.eventName,
      },
    ],
    idFields: [
      {
        label: msg`Endpoint URL`,
        Icon: IconLink,
        getId: (entry) => entry.properties?.url,
      },
      { label: msg`Webhook ID`, getId: (entry) => entry.properties?.webhookId },
    ],
    searchPlaceholder: msg`Search deliveries`,
    getSeverity: (entry) =>
      entry.properties?.success === true ? undefined : 'error',
    getDetailTitle: (entry) => {
      const url = entry.properties?.url ?? '';

      return `${entry.properties?.eventName} → ${isValidUrl(url) ? getUrlHostnameOrThrow(url) : url}`;
    },
    renderDetailContent: (entry) => (
      <NavigationButton
        size="sm"
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
    Icon: IconEye,
    table: EventLogTable.PAGEVIEW,
    filterFields: [{ ...LOG_CONSOLE_ACTOR_FILTER_FIELD, label: msg`Member` }],
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_PAGE_VIEW_COLUMNS,
    detailFields: [
      TIME_DETAIL_FIELD,
      {
        label: msg`Member`,
        Icon: IconUsers,
        renderValue: (entry) => <LogConsoleMemberCell userId={entry.userId} />,
      },
    ],
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
    getDetailTitle: (entry) => entry.properties?.pathname ?? entry.event,
  },
  {
    id: 'usage',
    label: msg`Usage`,
    Icon: IconGauge,
    table: EventLogTable.USAGE_EVENT,
    requiresAuditLogs: true,
    columns: LOG_CONSOLE_USAGE_EVENT_COLUMNS,
    detailFields: [
      TIME_DETAIL_FIELD,
      {
        label: msg`Spender`,
        Icon: IconUsers,
        renderValue: (entry) => (
          <LogConsoleMemberCell userWorkspaceId={entry.userId} />
        ),
      },
      {
        label: msg`Quantity`,
        Icon: IconSum,
        renderValue: (entry) => formatNumber(entry.properties?.quantity),
      },
      {
        label: msg`Usage`,
        Icon: IconCoins,
        renderValue: (entry) => (
          <LogConsoleCreditsCell
            creditsUsedMicro={entry.properties?.creditsUsedMicro}
          />
        ),
      },
    ],
    idFields: [
      { label: msg`User workspace ID`, getId: (entry) => entry.userId },
    ],
    getCountLabel: ({ count, formattedCount }) =>
      plural(count, {
        one: `${formattedCount} usage event`,
        other: `${formattedCount} usage events`,
      }),
    getDetailTitle: (entry) => {
      const operationTypeLabel = getUsageOperationTypeLabel(
        entry.properties?.operationType,
      );

      return isDefined(operationTypeLabel)
        ? t(operationTypeLabel)
        : (entry.properties?.operationType ?? entry.event);
    },
  },
];
