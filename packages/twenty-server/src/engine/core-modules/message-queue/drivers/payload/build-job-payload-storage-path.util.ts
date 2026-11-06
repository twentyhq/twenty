import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const SYSTEM_JOB_PAYLOAD_FOLDER = 'system';

// workspace payloads live under the workspace storage folder, so a workspace hard delete removes leftovers
export const buildJobPayloadStoragePath = ({
  scope,
  queueName,
  payloadId,
}: {
  scope: QueueJobScope;
  queueName: MessageQueue;
  payloadId: string;
}): string =>
  `${scope.isSystemJob ? SYSTEM_JOB_PAYLOAD_FOLDER : scope.workspaceId}/job-payloads/${queueName}/${payloadId}.json`;
