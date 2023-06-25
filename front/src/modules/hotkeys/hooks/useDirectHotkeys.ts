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
  dependencies: OptionsOrDependencyArray,
) {
  const [pendingHotkeys, setPendingHotkeys] =
    useRecoilState(pendingHotkeysState);

  const callbackIfDirectKey = function (
    keyboardEvent: KeyboardEvent,
    hotkeysEvent: Hotkey,
  ) {
    if (
      pendingHotkeys.pendingKey !== '' &&
      !pendingHotkeys.wasAKeyPressedAfterThat
    ) {
      setPendingHotkeys({
        pendingKey: pendingHotkeys.pendingKey,
        wasAKeyPressedAfterThat: true,
      });
      return;
    }
    callback(keyboardEvent, hotkeysEvent);
  };

  useHotkeys(
    keys,
    callbackIfDirectKey,
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    dependencies,
  );
}
