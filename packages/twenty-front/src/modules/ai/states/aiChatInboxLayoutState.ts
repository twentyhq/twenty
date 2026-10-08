import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { type AiChatInboxLayout } from '@/ai/types/AiChatInboxLayout';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatInboxLayoutState = createAtomState<AiChatInboxLayout>({
  key: 'aiChatInboxLayoutState',
  defaultValue: AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (layout) =>
    Object.values(AI_CHAT_INBOX_LAYOUT).includes(layout),
});
