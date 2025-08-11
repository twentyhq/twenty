import { type UserLookup } from '@/settings/admin-panel/types/UserLookup';
import { atom } from 'recoil';

export const userLookupResultState = atom<UserLookup | null>({
  key: 'userLookupResultState',
  default: null,
});
