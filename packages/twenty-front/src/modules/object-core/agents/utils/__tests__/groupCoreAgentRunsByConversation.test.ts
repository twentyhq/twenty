import { groupCoreAgentRunsByConversation } from '@/object-core/agents/utils/groupCoreAgentRunsByConversation';

const buildRun = (id: string, threadId: string) => ({
  id,
  threadId,
  threadTitle: `Conversation ${threadId}`,
});

describe('groupCoreAgentRunsByConversation', () => {
  it('keeps a conversation with a single run as a plain row', () => {
    expect(
      groupCoreAgentRunsByConversation([buildRun('run-1', 'thread-1')]),
    ).toEqual([{ type: 'run', run: buildRun('run-1', 'thread-1') }]);
  });

  it('folds runs of one conversation under it, at the position of its latest run', () => {
    const runs = [
      buildRun('run-3', 'thread-a'),
      buildRun('run-2', 'thread-b'),
      buildRun('run-1', 'thread-a'),
    ];

    expect(groupCoreAgentRunsByConversation(runs)).toEqual([
      {
        type: 'conversation',
        threadId: 'thread-a',
        title: 'Conversation thread-a',
        runs: [runs[0], runs[2]],
      },
      { type: 'run', run: runs[1] },
    ]);
  });
});
