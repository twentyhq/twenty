import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const appendAgentChatThreadIds = ({
  threadIds,
  threads,
}: {
  threadIds: string[];
  threads: Pick<AgentChatThreadRecord, 'id'>[];
}) => [
  ...threadIds,
  ...threads
    .map(({ id }) => id)
    .filter((threadId) => !threadIds.includes(threadId)),
];
