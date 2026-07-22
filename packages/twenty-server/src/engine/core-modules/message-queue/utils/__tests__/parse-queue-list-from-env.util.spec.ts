import { parseQueueListFromEnv } from 'src/engine/core-modules/message-queue/utils/parse-queue-list-from-env.util';

describe('parseQueueListFromEnv', () => {
  it('should return an empty array when the value is undefined', () => {
    expect(parseQueueListFromEnv(undefined)).toEqual([]);
  });

  it('should split, trim and drop empty entries', () => {
    expect(parseQueueListFromEnv('workspace-queue, workflow-queue ,')).toEqual([
      'workspace-queue',
      'workflow-queue',
    ]);
  });
});
