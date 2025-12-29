import { type Options, useHotkeys } from 'react-hotkeys-hook';
import { type Keys } from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '@/ui/utilities/hotkey/states/internal/pendingHotkeysState';

import { useGlobalHotkeysCallback } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeysCallback';
import { isDefined } from 'twenty-shared/utils';

export const useGlobalHotkeysSequence = (
  firstKey: Keys,
  secondKey: Keys,
  sequenceCallback: () => void,
  options: Options = {
    enableOnContentEditable: true,
    enableOnFormTags: true,
    preventDefault: true,
  },
  deps: any[] = [],
) => {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  const callGlobalHotkeysCallback = useGlobalHotkeysCallback();

  useHotkeys(
    firstKey,
    (keyboardEvent, hotkeysEvent) => {
      callGlobalHotkeysCallback({
        keyboardEvent,
        hotkeysEvent,
        containsModifier: false,
        callback: () => {
          setPendingHotkey(firstKey);
        },
        preventDefault: !!options.preventDefault,
      });
    },
    {
      enableOnContentEditable: options.enableOnContentEditable,
      enableOnFormTags: options.enableOnFormTags,
    },
    [setPendingHotkey],
  );

  useHotkeys(
    secondKey,
    (keyboardEvent, hotkeysEvent) => {
      callGlobalHotkeysCallback({
        keyboardEvent,
        hotkeysEvent,
        containsModifier: false,
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
        preventDefault: false,
      });
    },
    {
      enableOnContentEditable: options.enableOnContentEditable,
      enableOnFormTags: options.enableOnFormTags,
    },
    [pendingHotkey, setPendingHotkey, ...deps],
  );
};
