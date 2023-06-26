import { useHotkeys } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/pendingHotkeysState';

export function useSequenceHotkeys(
  firstKey: string,
  secondKey: string,
  callback: () => void,
) {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  useHotkeys(
    firstKey,
    () => {
      setPendingHotkey(firstKey);
    },
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
    [pendingHotkey, setPendingHotkey],
  );
}
