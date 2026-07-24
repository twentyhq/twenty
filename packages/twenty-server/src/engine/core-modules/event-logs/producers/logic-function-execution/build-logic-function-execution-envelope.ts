import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type LogicFunctionExecutionEntry } from 'src/engine/core-modules/event-logs/producers/logic-function-execution/logic-function-execution-entry.interface';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

export const buildLogicFunctionExecutionEnvelope = (
  entry: LogicFunctionExecutionEntry,
): WorkspaceEventEnvelope => ({
  table: 'logicFunctionExecution',
  row: {
    timestamp: formatDateTimeForClickHouse(entry.timestamp),
    workspaceId: entry.workspaceId,
    applicationId: entry.applicationId,
    logicFunctionId: entry.logicFunctionId,
    logicFunctionName: entry.logicFunctionName,
    executionId: entry.executionId,
    status: entry.status,
    errorType: entry.errorType,
    durationMs: entry.durationMs,
    creditsUsedMicro: entry.creditsUsedMicro,
    source: entry.source,
    workflowId: entry.workflowId,
    workflowVersionId: entry.workflowVersionId,
    workflowRunId: entry.workflowRunId,
    executionMode: entry.executionMode,
  },
});
