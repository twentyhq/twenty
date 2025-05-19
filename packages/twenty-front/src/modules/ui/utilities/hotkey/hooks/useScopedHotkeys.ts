import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeyCallback, Keys, Options } from 'react-hotkeys-hook/dist/types';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentFocusIdentifierSelector } from '@/ui/utilities/focus/states/currentFocusIdentifierSelector';
import { isDefined } from 'twenty-shared/utils';
import { pendingHotkeyState } from '../states/internal/pendingHotkeysState';
import { useScopedHotkeyCallback } from './useScopedHotkeyCallback';

type UseHotkeysOptionsWithoutBuggyOptions = Omit<Options, 'enabled'>;

export const useScopedHotkeys = (
  keys: Keys,
  callback: HotkeyCallback,
  scope: string,
  dependencies?: unknown[],
  options?: UseHotkeysOptionsWithoutBuggyOptions,
) => {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  const callScopedHotkeyCallback = useScopedHotkeyCallback(dependencies);

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

  const currentFocusIdentifier = useRecoilValue(currentFocusIdentifierSelector);

  return useHotkeys(
    keys,
    (keyboardEvent, hotkeysEvent) => {
      if (isDefined(currentFocusIdentifier)) {
        return;
      }

      callScopedHotkeyCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          if (!pendingHotkey) {
            callback(keyboardEvent, hotkeysEvent);
            return;
          }
          setPendingHotkey(null);
        },
        scope,
        preventDefault,
      });
    },
    {
      enableOnContentEditable,
      enableOnFormTags,
      ignoreModifiers,
    },
    [currentFocusIdentifier, ...(dependencies ?? [])],
  );
};
