/* @license Enterprise */

import { EventLogTable } from 'twenty-shared/types';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type EventLogRecord } from 'src/engine/core-modules/event-logs/dtos/event-log-result.dto';
import {
  type ApplicationLogRow,
  type ObjectEventRow,
  type PageviewRow,
  type UsageEventRow,
} from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

type StoredRow<TRow> = Partial<Omit<TRow, 'type' | 'version'>> & {
  timestamp: string;
};

type StoredEventRow = StoredRow<ObjectEventRow & Pick<PageviewRow, 'name'>>;

export type EventLogTypeDefinition = {
  clickHouseTable: string;
  // null = free on every plan; otherwise the required billing entitlement
  requiresEntitlement: BillingEntitlementKey | null;
  eventFieldName: string;
  // The shared dispatcher stamps `timestamp`; each type maps only its own fields.
  normalize: (
    row: Record<string, unknown>,
  ) => Omit<EventLogRecord, 'timestamp'>;
};

const normalizeGenericEvent =
  (eventFieldName: 'event' | 'name') =>
  (row: Record<string, unknown>): Omit<EventLogRecord, 'timestamp'> => {
    const record = row as StoredEventRow;

    return {
      event: record[eventFieldName] ?? '',
      userId: record.userId ?? undefined,
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
      const record = row as StoredRow<UsageEventRow>;

      return {
        event: record.resourceType ?? '',
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
      const record = row as StoredRow<ApplicationLogRow>;

      return {
        event: record.logicFunctionName ?? '',
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
