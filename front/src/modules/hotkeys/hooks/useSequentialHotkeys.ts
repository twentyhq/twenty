import { useHotkeys } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';

import { pendingHotkeysState } from '../states/pendingHotkeysState';

export function useSequentialHotkeys(
  firstKeys: string,
  secondKey: string,
  callback: () => void,
) {
  const [pendingHotkeys, setPendingHotkeys] =
    useRecoilState(pendingHotkeysState);

  useHotkeys(
    firstKeys,
    () => {
      setPendingHotkeys({
        pendingKey: firstKeys,
        wasAKeyPressedAfterThat: pendingHotkeys.wasAKeyPressedAfterThat,
      });
    },
    [setPendingHotkeys, pendingHotkeys],
  );

  useHotkeys(
    secondKey,
    () => {
      if (pendingHotkeys.pendingKey !== firstKeys) {
        return;
      }
      callback();
      setPendingHotkeys({
        pendingKey: '',
        wasAKeyPressedAfterThat: true,
      });
    },
    [pendingHotkeys, setPendingHotkeys],
  );
}
