import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const agentChatThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatThreadsSelector',
  get: ({ get }) =>
    (get(agentChatThreadListState)?.threadIds ?? [])
      .map(
        (threadId) =>
          get(recordStoreFamilyState, threadId) as
            | AgentChatThreadRecord
            | null
            | undefined,
      )
      .filter(isDefined),
});
