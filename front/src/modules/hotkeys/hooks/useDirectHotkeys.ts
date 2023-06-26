import { useHotkeys } from 'react-hotkeys-hook';
import {
  Hotkey,
  HotkeyCallback,
  OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeysState } from '../states/pendingHotkeysState';

export function useDirectHotkeys(
  keys: string,
  callback: HotkeyCallback,
  dependencies?: OptionsOrDependencyArray,
) {
  const [pendingHotkeys, setPendingHotkeys] =
    useRecoilState(pendingHotkeysState);

  const callbackIfDirectKey = function (
    keyboardEvent: KeyboardEvent,
    hotkeysEvent: Hotkey,
  ) {
    if (pendingHotkeys.pendingKeys === '') {
      callback(keyboardEvent, hotkeysEvent);
      return;
    }
    if (pendingHotkeys.aKeyWasPressedAfterTheLastPendingKeys) {
      callback(keyboardEvent, hotkeysEvent);
      return;
    }
    setPendingHotkeys({
      pendingKeys: pendingHotkeys.pendingKeys,
      aKeyWasPressedAfterTheLastPendingKeys: true,
    });
  };

  useHotkeys(keys, callbackIfDirectKey, dependencies);
}
