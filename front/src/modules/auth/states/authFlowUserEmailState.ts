import { atom } from 'recoil';

export const authFlowUserEmailState = atom({
  key: 'authFlowUserEmailState',
  default: process.env.NODE_ENV === 'development' ? 'tim@apple.dev' : '',
});
