import { Options, useHotkeys } from 'react-hotkeys-hook';
import { Keys } from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/internal/pendingHotkeysState';

import { useScopedHotkeyCallback } from './useScopedHotkeyCallback';
import { isDefined } from 'twenty-shared/utils';

export const useSequenceHotkeys = (
  firstKey: Keys,
  secondKey: Keys,
  sequenceCallback: () => void,
  scope: string,
  options: Options = {
    enableOnContentEditable: true,
    enableOnFormTags: true,
    preventDefault: true,
  },
  deps: any[] = [],
) => {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  const callScopedHotkeyCallback = useScopedHotkeyCallback();

  useHotkeys(
    firstKey,
    (keyboardEvent, hotkeysEvent) => {
      callScopedHotkeyCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          setPendingHotkey(firstKey);
        },
        scope,
        preventDefault: !!options.preventDefault,
      });
    },
    {
      enableOnContentEditable: options.enableOnContentEditable,
      enableOnFormTags: options.enableOnFormTags,
    },
    [setPendingHotkey, scope],
  );

  useHotkeys(
    secondKey,
    (keyboardEvent, hotkeysEvent) => {
      callScopedHotkeyCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          if (pendingHotkey !== firstKey) {
            return;
          }

          setPendingHotkey(null);

          if (isDefined(options.preventDefault)) {
            keyboardEvent.stopImmediatePropagation();
            keyboardEvent.stopPropagation();
            keyboardEvent.preventDefault();
          }

          sequenceCallback();
        },
        scope,
        preventDefault: false,
      });
    },
    {
      enableOnContentEditable: options.enableOnContentEditable,
      enableOnFormTags: options.enableOnFormTags,
    },
    [pendingHotkey, setPendingHotkey, scope, ...deps],
  );
};
