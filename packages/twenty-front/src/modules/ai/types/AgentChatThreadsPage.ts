import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export type AgentChatThreadsPage = {
  threads: AgentChatThreadRecord[];
  participants: AgentChatThreadParticipantFieldsFragment[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
};
