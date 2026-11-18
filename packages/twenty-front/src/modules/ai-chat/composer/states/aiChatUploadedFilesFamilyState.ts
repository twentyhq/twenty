import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

import { type AiChatFileUIPart } from '@/ai-chat/composer/types/AiChatFileUIPart';

export const aiChatUploadedFilesFamilyState = createAtomFamilyState<
  AiChatFileUIPart[],
  { threadId: string }
>({
  key: 'ai/agentChatUploadedFilesFamilyState',
  defaultValue: [],
  useSessionStorage: true,
});
