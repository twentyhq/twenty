import { Options, useHotkeys } from 'react-hotkeys-hook';
import { Keys } from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/internal/pendingHotkeysState';

export function useSequenceHotkeys(
  firstKey: Keys,
  secondKey: Keys,
  callback: () => void,
  scope: string,
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
    { ...options, scopes: [scope] },
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
    { ...options, scopes: [scope] },
    [pendingHotkey, setPendingHotkey],
  );
}
