import { type SearchRecord } from '~/generated/graphql';

export type AgentChatDraft = {
  serializedDocument: string;
  // A chat started from a record is filed under it on its first send, so the
  // record travels with the draft that mentions it until then.
  pendingRecordTarget?: Pick<SearchRecord, 'objectNameSingular' | 'recordId'>;
};
