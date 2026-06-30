import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type AgentChatFileUIPart } from '@/ai/types/agent-chat-file-ui-part.type';

export const agentChatUploadedFilesState = createAtomState<
  AgentChatFileUIPart[]
>({
  key: 'ai/agentChatUploadedFilesState',
  defaultValue: [],
});
