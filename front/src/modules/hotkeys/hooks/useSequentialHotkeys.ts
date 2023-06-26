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
        pendingKeys: firstKeys,
        aKeyWasPressedAfterTheLastPendingKeys:
          pendingHotkeys.aKeyWasPressedAfterTheLastPendingKeys,
      });
    },
    [setPendingHotkeys, pendingHotkeys],
  );

  useHotkeys(
    secondKey,
    () => {
      console.log('Sequential Key pressed');
      console.log(secondKey);
      if (pendingHotkeys.pendingKeys !== firstKeys) {
        return;
      }
      callback();
      setPendingHotkeys({
        pendingKeys: '',
        aKeyWasPressedAfterTheLastPendingKeys: false,
      });
    },
    [pendingHotkeys, setPendingHotkeys],
  );
}
