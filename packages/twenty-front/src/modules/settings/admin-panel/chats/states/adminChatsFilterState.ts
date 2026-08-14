import { DEFAULT_ADMIN_CHATS_FILTER_STATE } from '@/settings/admin-panel/chats/constants/DefaultAdminChatsFilterState';
import { type AdminChatsFilterState } from '@/settings/admin-panel/chats/types/AdminChatsFilterState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const adminChatsFilterState = createAtomState<AdminChatsFilterState>({
  key: 'adminChatsFilterState',
  defaultValue: DEFAULT_ADMIN_CHATS_FILTER_STATE,
});
