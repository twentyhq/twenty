import { atom } from 'recoil';

export const commandMenuViewableRecordIdState = atom<string | null>({
  key: 'command-menu/commandMenuViewableRecordIdState',
  default: null,
});
