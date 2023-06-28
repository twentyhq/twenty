import { useHotkeys } from 'react-hotkeys-hook';
import {
  Hotkey,
  HotkeyCallback,
  OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/pendingHotkeysState';

export function useDirectHotkeys(
  keys: string,
  callback: HotkeyCallback,
  dependencies?: OptionsOrDependencyArray,
) {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  function callbackIfDirectKey(
    keyboardEvent: KeyboardEvent,
    hotkeysEvent: Hotkey,
  ) {
    if (!pendingHotkey) {
      callback(keyboardEvent, hotkeysEvent);
      return;
    }
    setPendingHotkey(null);
  }

  useHotkeys(keys, callbackIfDirectKey, dependencies);
}
