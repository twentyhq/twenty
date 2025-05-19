import { Options, useHotkeys } from 'react-hotkeys-hook';
import { Keys } from 'react-hotkeys-hook/dist/types';
import { useRecoilState, useRecoilValue } from 'recoil';

import { pendingHotkeyState } from '../states/internal/pendingHotkeysState';

import { currentFocusIdentifierSelector } from '@/ui/utilities/focus/states/currentFocusIdentifierSelector';
import { isDefined } from 'twenty-shared/utils';
import { useScopedHotkeyCallback } from './useScopedHotkeyCallback';

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

  const currentFocusIdentifier = useRecoilValue(currentFocusIdentifierSelector);

  useHotkeys(
    firstKey,
    (keyboardEvent, hotkeysEvent) => {
      if (isDefined(currentFocusIdentifier)) {
        return;
      }

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
      if (isDefined(currentFocusIdentifier)) {
        return;
      }

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
