import { atom } from 'recoil';

type pendingHotKeyType = {
  pendingKeys: string;
  aKeyWasPressedAfterTheLastPendingKeys: boolean;
};

export const pendingHotkeysState = atom<pendingHotKeyType>({
  key: 'command-menu/isPendingHotkeysState',
  default: {
    pendingKeys: '',
    aKeyWasPressedAfterTheLastPendingKeys: false,
  },
});
