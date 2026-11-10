import { isDefined } from 'twenty-shared/utils';

import { type CoreAgentRun } from '@/object-core/agents/types/CoreAgentRun';
import { type CoreAgentRunListItem } from '@/object-core/agents/types/CoreAgentRunListItem';

// Runs sharing a conversation the reader can open fold under it, placed at its
// latest run; a conversation with a single run stays a plain row
export const groupCoreAgentRunsByConversation = <
  TRun extends Pick<CoreAgentRun, 'threadId' | 'threadTitle' | 'canReadThread'>,
>(
  runs: TRun[],
): CoreAgentRunListItem<TRun>[] => {
  const runsByThreadId = new Map<string, TRun[]>();

  for (const run of runs) {
    if (!isDefined(run.threadId) || !run.canReadThread) {
      continue;
    }

    runsByThreadId.set(run.threadId, [
      ...(runsByThreadId.get(run.threadId) ?? []),
      run,
    ]);
  }

  const listedThreadIds = new Set<string>();

  return runs.flatMap((run): CoreAgentRunListItem<TRun>[] => {
    // a one-shot run, or one whose conversation is not shared with the reader, shows its own details
    if (!isDefined(run.threadId) || !run.canReadThread) {
      return [{ type: 'run', run }];
    }

    if (listedThreadIds.has(run.threadId)) {
      return [];
    }

    listedThreadIds.add(run.threadId);

    const conversationRuns = runsByThreadId.get(run.threadId) ?? [run];

    return conversationRuns.length > 1
      ? [
          {
            type: 'conversation',
            threadId: run.threadId,
            title: run.threadTitle ?? null,
            runs: conversationRuns,
          },
        ]
      : [{ type: 'run', run }];
  });
};
