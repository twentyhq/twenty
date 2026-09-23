import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type AgentChatFileUIPart } from '@/ai/types/AgentChatFileUIPart';

export const agentChatUploadedFilesState = createAtomState<
  AgentChatFileUIPart[]
>({
  key: 'ai/agentChatUploadedFilesState',
  defaultValue: [],
});
