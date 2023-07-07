import { useHotkeys } from 'react-hotkeys-hook';
import {
  Hotkey,
  HotkeyCallback,
  Keys,
  Options,
  OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/pendingHotkeysState';
import { HotkeysScope } from '../types/HotkeysScope';

export function useDirectHotkeys(
  keys: Keys,
  callback: HotkeyCallback,
  scopes: HotkeysScope[],
  dependencies?: OptionsOrDependencyArray,
  options: Options = {
    enableOnContentEditable: true,
    enableOnFormTags: true,
    preventDefault: true,
  },
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

  useHotkeys(keys, callbackIfDirectKey, { ...options, scopes }, dependencies);
}
