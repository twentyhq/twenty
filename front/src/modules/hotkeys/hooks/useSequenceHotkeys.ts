import { Options, useHotkeys } from 'react-hotkeys-hook';
import { Keys } from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/pendingHotkeysState';
import { HotkeysScope } from '../types/HotkeysScope';

export function useSequenceHotkeys(
  firstKey: Keys,
  secondKey: Keys,
  callback: () => void,
  scopes: HotkeysScope[],
  options: Options = {
    enableOnContentEditable: true,
    enableOnFormTags: true,
    preventDefault: true,
  },
) {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  useHotkeys(
    firstKey,
    () => {
      setPendingHotkey(firstKey);
    },
    { ...options, scopes },
    [pendingHotkey],
  );

  useHotkeys(
    secondKey,
    () => {
      if (pendingHotkey !== firstKey) {
        return;
      }
      setPendingHotkey(null);
      callback();
    },
    { ...options, scopes },
    [pendingHotkey, setPendingHotkey],
  );
}
