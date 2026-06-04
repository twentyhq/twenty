import { EventLogTable } from 'twenty-shared/types';

import { type EventLogRecord } from 'src/engine/core-modules/event-logs/dtos/event-log-result.dto';

export type ClickHouseEventRecord = {
  event?: string;
  name?: string;
  timestamp: string;
  userId?: string;
  properties?: Record<string, unknown>;
  recordId?: string;
  objectMetadataId?: string;
  isCustom?: boolean;
};

export type ClickHouseUsageEventRecord = {
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

export type ClickHouseApplicationLogRecord = {
  timestamp: string;
  applicationId?: string;
  logicFunctionId?: string;
  logicFunctionName?: string;
  executionId?: string;
  level?: string;
  message?: string;
  properties?: Record<string, unknown>;
};

// Maps a ClickHouse row (read back, or pushed live — same columns) to the GraphQL record.
export const normalizeEventLogRecords = (
  records: Record<string, unknown>[],
  table: EventLogTable,
): EventLogRecord[] => {
  if (table === EventLogTable.USAGE_EVENT) {
    return (records as ClickHouseUsageEventRecord[]).map((record) => ({
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
    }));
  }

  if (table === EventLogTable.APPLICATION_LOG) {
    return (records as ClickHouseApplicationLogRecord[]).map((record) => ({
      event: record.logicFunctionName ?? '',
      timestamp: new Date(record.timestamp),
      properties: {
        ...(record.properties ?? {}),
        level: record.level,
        message: record.message,
        executionId: record.executionId,
        logicFunctionId: record.logicFunctionId,
        applicationId: record.applicationId,
      },
    }));
  }

  return (records as ClickHouseEventRecord[]).map((record) => {
    const eventName =
      table === EventLogTable.PAGEVIEW
        ? (record.name ?? '')
        : (record.event ?? '');

    return {
      event: eventName,
      timestamp: new Date(record.timestamp),
      userId: record.userId,
      properties: record.properties,
      recordId: record.recordId,
      objectMetadataId: record.objectMetadataId,
      isCustom: record.isCustom,
    };
  });
};
