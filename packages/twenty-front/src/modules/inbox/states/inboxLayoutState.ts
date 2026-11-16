import { INBOX_LAYOUT } from '@/inbox/constants/InboxLayout';
import { type InboxLayout } from '@/inbox/types/InboxLayout';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxLayoutState = createAtomState<InboxLayout>({
  key: 'aiChatInboxLayoutState',
  defaultValue: INBOX_LAYOUT.SPLIT_VIEW,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (layout) => Object.values(INBOX_LAYOUT).includes(layout),
});
