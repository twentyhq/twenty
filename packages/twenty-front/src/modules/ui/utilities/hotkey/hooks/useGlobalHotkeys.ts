import { useCallback } from 'react';

import { useGlobalHotkeysCallback } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeysCallback';
import { pendingHotkeyState } from '@/ui/utilities/hotkey/states/internal/pendingHotkeysState';
import { useStore } from 'jotai';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  type HotkeyCallback,
  type Keys,
  type Options,
} from 'react-hotkeys-hook/dist/types';
import { isDefined } from 'twenty-shared/utils';

type UseHotkeysOptionsWithoutBuggyOptions = Omit<Options, 'enabled'>;

export const useGlobalHotkeys = ({
  keys,
  callback,
  containsModifier,
  dependencies,
  options,
}: {
  keys: Keys;
  callback: HotkeyCallback;
  containsModifier: boolean;
  dependencies?: unknown[];
  options?: UseHotkeysOptionsWithoutBuggyOptions;
}) => {
  const store = useStore();

  const callGlobalHotkeysCallback = useGlobalHotkeysCallback(dependencies);

  const enableOnContentEditable = isDefined(options?.enableOnContentEditable)
    ? options.enableOnContentEditable
    : true;

  const enableOnFormTags = isDefined(options?.enableOnFormTags)
    ? options.enableOnFormTags
    : true;

  const preventDefault = isDefined(options?.preventDefault)
    ? options.preventDefault === true
    : true;

  const ignoreModifiers = isDefined(options?.ignoreModifiers)
    ? options.ignoreModifiers === true
    : false;

  const handleCallback = useCallback(
    async (keyboardEvent: KeyboardEvent, hotkeysEvent: any) => {
      const pendingHotkey = store.get(pendingHotkeyState.atom);

      if (!pendingHotkey) {
        callback(keyboardEvent, hotkeysEvent);
      }

      store.set(pendingHotkeyState.atom, null);
    },
    [callback, store],
  );

  return useHotkeys(
    keys,
    (keyboardEvent, hotkeysEvent) => {
      callGlobalHotkeysCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          handleCallback(keyboardEvent, hotkeysEvent);
        },
        preventDefault,
        containsModifier,
      });
    },
    {
      enableOnContentEditable,
      enableOnFormTags,
      ignoreModifiers,
    },
    dependencies,
  );
};
