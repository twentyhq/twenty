import { atomFamily } from 'recoil';

export const currentViewIdScopedState = atomFamily<string | undefined, string>({
  key: 'currentViewIdScopedState',
  default: undefined,
});
