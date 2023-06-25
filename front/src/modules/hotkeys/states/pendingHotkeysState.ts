import { atom } from 'recoil';

type pendingHotKeyType = {
  pendingKey: string;
  wasAKeyPressedAfterThat: boolean;
};

export const pendingHotkeysState = atom<pendingHotKeyType>({
  key: 'command-menu/isPendingHotkeysState',
  default: {
    pendingKey: '',
    wasAKeyPressedAfterThat: false,
  },
});
