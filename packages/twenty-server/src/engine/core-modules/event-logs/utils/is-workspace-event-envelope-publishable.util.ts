import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import { isBillableOperationType } from 'src/engine/core-modules/usage/utils/is-billable-operation-type.util';

// The live stream must hide what queryEventLogs hides: non-billable usage is never shown to the workspace
export const isWorkspaceEventEnvelopePublishable = (
  event: WorkspaceEventEnvelope,
): boolean =>
  event.table !== 'usageEvent' ||
  isBillableOperationType(event.row.operationType);
