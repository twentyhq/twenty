import { buildJobMemoryLimitRefusalLogMessage } from 'src/engine/core-modules/message-queue/drivers/memory/build-job-memory-limit-refusal-log-message.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

describe('buildJobMemoryLimitRefusalLogMessage', () => {
  it('lists every refusal field as key=value pairs', () => {
    expect(
      buildJobMemoryLimitRefusalLogMessage({
        queueName: MessageQueue.logicFunctionQueue,
        groupKey: 'workspace:ws-1',
        reason: 'share',
        mode: 'enforce',
        requestedBytes: 10,
        usedBytes: 20,
        limitBytes: 25,
      }),
    ).toBe(
      `Job memory limit refused on queue ${MessageQueue.logicFunctionQueue} [key=workspace:ws-1 reason=share mode=enforce requestedBytes=10 usedBytes=20 limitBytes=25]`,
    );
  });

  it('omits the used bytes of a size refusal', () => {
    expect(
      buildJobMemoryLimitRefusalLogMessage({
        queueName: MessageQueue.logicFunctionQueue,
        groupKey: 'system',
        reason: 'size',
        mode: 'observe',
        requestedBytes: 2_000_000,
        limitBytes: 1_048_576,
      }),
    ).toBe(
      `Job memory limit refused on queue ${MessageQueue.logicFunctionQueue} [key=system reason=size mode=observe requestedBytes=2000000 limitBytes=1048576]`,
    );
  });
});
