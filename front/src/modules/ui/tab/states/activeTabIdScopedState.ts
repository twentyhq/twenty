import { atomFamily } from 'recoil';

export const activeTabIdScopedState = atomFamily<string | null, string>({
  key: 'activeTabIdScopedState',
  default: null,
});
