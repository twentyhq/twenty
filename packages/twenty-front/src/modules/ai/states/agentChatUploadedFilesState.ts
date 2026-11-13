import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type InboxFileUIPart } from '@/ai/types/AgentChatFileUIPart';

export const inboxUploadedFilesState = createAtomState<InboxFileUIPart[]>({
  key: 'ai/agentChatUploadedFilesState',
  defaultValue: [],
  useSessionStorage: true,
});
