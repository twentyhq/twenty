import { isDefined } from 'twenty-shared/utils';

import { type CoreAgentRun } from '@/object-core/agents/types/CoreAgentRun';
import { type CoreAgentRunListItem } from '@/object-core/agents/types/CoreAgentRunListItem';

type GroupableRun = Pick<
  CoreAgentRun,
  'threadId' | 'threadTitle' | 'canReadThread'
>;

const isInReadableConversation = <TRun extends GroupableRun>(
  run: TRun,
): run is TRun & { threadId: string } =>
  isDefined(run.threadId) && run.canReadThread;

// Runs of a readable conversation fold into one row placed at its latest run
export const groupCoreAgentRunsByConversation = <TRun extends GroupableRun>(
  runs: TRun[],
): CoreAgentRunListItem<TRun>[] => {
  const runsByThreadId = new Map<string, TRun[]>();

  for (const run of runs) {
    if (!isInReadableConversation(run)) {
      continue;
    }

    runsByThreadId.set(run.threadId, [
      ...(runsByThreadId.get(run.threadId) ?? []),
      run,
    ]);
  }

  const listedThreadIds = new Set<string>();

  return runs.flatMap((run): CoreAgentRunListItem<TRun>[] => {
    if (!isInReadableConversation(run)) {
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
