import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

import { type AiChatFileUIPart } from '@/ai-chat/types/AiChatFileUIPart';

export const aiChatComposerAttachmentsFamilyState = createAtomFamilyState<
  AiChatFileUIPart[],
  { threadId: string }
>({
  key: 'aiChatComposerAttachmentsFamilyState',
  defaultValue: [],
  useSessionStorage: true,
});
