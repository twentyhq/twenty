import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// A record page chat and the side panel can show the thread at the same time
export const aiChatThreadOpenViewCountFamilyState = createAtomFamilyState<
  number,
  { threadId: string }
>({
  key: 'ai/aiChatThreadOpenViewCountFamilyState',
  defaultValue: 0,
});
