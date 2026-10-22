import { MessageChannel as NodeMessageChannel } from 'node:worker_threads';

import { waitForScheduledReactCommit } from '../waitForScheduledReactCommit';

const mutableGlobal = globalThis as unknown as Record<string, unknown>;

describe('waitForScheduledReactCommit', () => {
  const originalMessageChannel = mutableGlobal.MessageChannel;

  beforeAll(() => {
    mutableGlobal.MessageChannel = NodeMessageChannel;
  });

  afterAll(() => {
    mutableGlobal.MessageChannel = originalMessageChannel;
  });

  it('should resolve only after a task scheduled before it has run', async () => {
    const events: string[] = [];
    const scheduledCommit = new NodeMessageChannel();

    scheduledCommit.port1.on('message', () => {
      events.push('commit');
      scheduledCommit.port1.close();
    });
    scheduledCommit.port2.postMessage(null);

    await waitForScheduledReactCommit();
    events.push('resolved');

    expect(events).toEqual(['commit', 'resolved']);
  });
});
