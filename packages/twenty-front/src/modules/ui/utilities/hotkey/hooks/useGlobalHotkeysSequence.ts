import { Options, useHotkeys } from 'react-hotkeys-hook';
import { Keys } from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/internal/pendingHotkeysState';

import { useGlobalHotkeysCallback } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeysCallback';
import { isDefined } from 'twenty-shared/utils';

export const useGlobalHotkeysSequence = (
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
