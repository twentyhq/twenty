import { buildJobPayloadStoragePath } from 'src/engine/core-modules/message-queue/drivers/payload/build-job-payload-storage-path.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

describe('buildJobPayloadStoragePath', () => {
  it('scopes workspace and application jobs to their workspace folder', () => {
    expect(
      buildJobPayloadStoragePath({
        scope: { workspaceId: 'ws-1', applicationUniversalIdentifier: 'app' },
        queueName: MessageQueue.logicFunctionQueue,
        payloadId: 'payload-1',
      }),
    ).toBe('ws-1/job-payloads/logic-function-queue/payload-1.json');
    expect(
      buildJobPayloadStoragePath({
        scope: { isWorkspaceJob: true, workspaceId: 'ws-2' },
        queueName: MessageQueue.workspaceQueue,
        payloadId: 'payload-2',
      }),
    ).toBe('ws-2/job-payloads/workspace-queue/payload-2.json');
  });

  it('stores system jobs under the system folder', () => {
    expect(
      buildJobPayloadStoragePath({
        scope: { isSystemJob: true },
        queueName: MessageQueue.cronQueue,
        payloadId: 'payload-3',
      }),
    ).toBe(`system/job-payloads/${MessageQueue.cronQueue}/payload-3.json`);
  });
});
