import { type SearchRecord } from '~/generated/graphql';

export type InboxConversationTarget = Pick<
  SearchRecord,
  'objectNameSingular' | 'recordId'
>;
