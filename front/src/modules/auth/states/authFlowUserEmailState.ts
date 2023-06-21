import { atom } from 'recoil';

export const authFlowUserEmailState = atom<string>({
  key: 'authFlowUserEmailState',
  default: '',
});
