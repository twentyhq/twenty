import { atom } from 'recoil';

export const aiStreamingMessageState = atom<string>({
  key: 'aiStreamingMessageState',
  default: '',
});
