import { groupCoreAgentRunsByConversation } from '@/object-core/agents/utils/groupCoreAgentRunsByConversation';

const buildRun = ({
  id,
  threadId,
}: {
  id: string;
  threadId: string | null;
}) => ({
  id,
  threadId,
  threadTitle: `Conversation ${threadId}`,
});

describe('groupCoreAgentRunsByConversation', () => {
  it('keeps a conversation with a single run as a plain row', () => {
    expect(
      groupCoreAgentRunsByConversation([
        buildRun({ id: 'run-1', threadId: 'thread-1' }),
      ]),
    ).toEqual([
      { type: 'run', run: buildRun({ id: 'run-1', threadId: 'thread-1' }) },
    ]);
  });

  it('folds runs of one conversation under it, at the position of its latest run', () => {
    const runs = [
      buildRun({ id: 'run-3', threadId: 'thread-a' }),
      buildRun({ id: 'run-2', threadId: 'thread-b' }),
      buildRun({ id: 'run-1', threadId: 'thread-a' }),
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

  it('lists a run without a conversation as a plain row', () => {
    const runs = [
      buildRun({ id: 'run-2', threadId: null }),
      buildRun({ id: 'run-1', threadId: null }),
    ];

    expect(groupCoreAgentRunsByConversation(runs)).toEqual([
      { type: 'run', run: runs[0] },
      { type: 'run', run: runs[1] },
    ]);
  });
});
