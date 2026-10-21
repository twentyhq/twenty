import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { AgentChatThreadFilterStatus as AgentChatThreadFilterStatusGraphqlValue } from '~/generated-metadata/graphql';

export const AGENT_CHAT_THREAD_FILTER_STATUS_GRAPHQL_VALUES: Record<
  AgentChatThreadFilterStatus,
  AgentChatThreadFilterStatusGraphqlValue
> = {
  active: AgentChatThreadFilterStatusGraphqlValue.ACTIVE,
  needsInput: AgentChatThreadFilterStatusGraphqlValue.NEEDS_INPUT,
  mentions: AgentChatThreadFilterStatusGraphqlValue.MENTIONS,
  assigned: AgentChatThreadFilterStatusGraphqlValue.ASSIGNED,
  snoozed: AgentChatThreadFilterStatusGraphqlValue.SNOOZED,
  done: AgentChatThreadFilterStatusGraphqlValue.DONE,
};
