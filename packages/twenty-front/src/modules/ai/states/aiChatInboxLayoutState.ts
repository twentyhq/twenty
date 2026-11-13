import { INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { type InboxLayout } from '@/ai/types/AiChatInboxLayout';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxLayoutState = createAtomState<InboxLayout>({
  key: 'aiChatInboxLayoutState',
  defaultValue: INBOX_LAYOUT.SPLIT_VIEW,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (layout) => Object.values(INBOX_LAYOUT).includes(layout),
});
