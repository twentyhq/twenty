/* @license Enterprise */

import { EventLogTable } from 'twenty-shared/types';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type EventLogRecord } from 'src/engine/core-modules/event-logs/dtos/event-log-result.dto';

type ClickHouseEventRow = {
  event?: string;
  name?: string;
  timestamp: string;
  userId?: string;
  properties?: Record<string, unknown>;
  recordId?: string;
  objectMetadataId?: string;
  isCustom?: boolean;
};

type ClickHouseUsageEventRow = {
  timestamp: string;
  userWorkspaceId?: string;
  resourceType?: string;
  operationType?: string;
  quantity?: number;
  unit?: string;
  creditsUsedMicro?: number;
  resourceId?: string;
  resourceContext?: string;
  metadata?: Record<string, unknown>;
};

type ClickHouseApplicationLogRow = {
  timestamp: string;
  applicationId?: string;
  logicFunctionId?: string;
  logicFunctionName?: string;
  executionId?: string;
  level?: string;
  message?: string;
};

// Single source of truth for an event-log type: the ClickHouse table it lives in
// (also its live presence key), who may read it, the column the free-text filter
// matches, and how a stored row maps to the GraphQL record. Adding a type = one
// entry here (+ a ClickHouse migration, and a producer adapter if it's a new source).
export type EventLogTypeDefinition = {
  clickHouseTable: string;
  // null = readable on every plan (applicationLog today); otherwise the billing
  // entitlement the workspace must hold.
  requiresEntitlement: BillingEntitlementKey | null;
  eventFieldName: string;
  normalize: (row: Record<string, unknown>) => EventLogRecord;
};

const normalizeGenericEvent =
  (eventFieldName: 'event' | 'name') =>
  (row: Record<string, unknown>): EventLogRecord => {
    const record = row as ClickHouseEventRow;

    return {
      event: record[eventFieldName] ?? '',
      timestamp: new Date(record.timestamp),
      userId: record.userId,
      properties: record.properties,
      recordId: record.recordId,
      objectMetadataId: record.objectMetadataId,
      isCustom: record.isCustom,
    };
  };

export const EVENT_LOG_TYPES: Record<EventLogTable, EventLogTypeDefinition> = {
  [EventLogTable.WORKSPACE_EVENT]: {
    clickHouseTable: 'workspaceEvent',
    requiresEntitlement: BillingEntitlementKey.AUDIT_LOGS,
    eventFieldName: 'event',
    normalize: normalizeGenericEvent('event'),
  },
  [EventLogTable.PAGEVIEW]: {
    clickHouseTable: 'pageview',
    requiresEntitlement: BillingEntitlementKey.AUDIT_LOGS,
    eventFieldName: 'name',
    normalize: normalizeGenericEvent('name'),
  },
  [EventLogTable.OBJECT_EVENT]: {
    clickHouseTable: 'objectEvent',
    requiresEntitlement: BillingEntitlementKey.AUDIT_LOGS,
    eventFieldName: 'event',
    normalize: normalizeGenericEvent('event'),
  },
  [EventLogTable.USAGE_EVENT]: {
    clickHouseTable: 'usageEvent',
    requiresEntitlement: BillingEntitlementKey.AUDIT_LOGS,
    eventFieldName: 'resourceType',
    normalize: (row) => {
      const record = row as ClickHouseUsageEventRow;

      return {
        event: record.resourceType ?? '',
        timestamp: new Date(record.timestamp),
        userId: record.userWorkspaceId,
        properties: {
          ...(record.metadata ?? {}),
          operationType: record.operationType,
          quantity: record.quantity,
          unit: record.unit,
          creditsUsedMicro: record.creditsUsedMicro,
          resourceId: record.resourceId,
          resourceContext: record.resourceContext,
        },
      };
    },
  },
  [EventLogTable.APPLICATION_LOG]: {
    clickHouseTable: 'applicationLog',
    requiresEntitlement: null,
    eventFieldName: 'logicFunctionName',
    normalize: (row) => {
      const record = row as ClickHouseApplicationLogRow;

      return {
        event: record.logicFunctionName ?? '',
        timestamp: new Date(record.timestamp),
        properties: {
          level: record.level,
          message: record.message,
          executionId: record.executionId,
          logicFunctionId: record.logicFunctionId,
          applicationId: record.applicationId,
        },
      };
    },
  },
};

export const getClickHouseTableName = (table: EventLogTable): string =>
  EVENT_LOG_TYPES[table].clickHouseTable;
