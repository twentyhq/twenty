import { type SearchRecord } from '~/generated/graphql';

export type AiChatConversationTarget = Pick<
  SearchRecord,
  'objectNameSingular' | 'recordId'
>;
