import { type SearchRecord } from '~/generated/graphql';

export type AgentChatConversationTarget = Pick<
  SearchRecord,
  'objectNameSingular' | 'recordId'
>;
