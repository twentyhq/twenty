import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type AiChatFileUIPart } from '@/ai/types/AiChatFileUIPart';

export const aiChatUploadedFilesState = createAtomState<AiChatFileUIPart[]>({
  key: 'ai/agentChatUploadedFilesState',
  defaultValue: [],
  useSessionStorage: true,
});
