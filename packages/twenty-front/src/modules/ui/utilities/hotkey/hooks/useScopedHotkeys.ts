import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeyCallback, Keys, Options } from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/internal/pendingHotkeysState';

import { isDefined } from 'twenty-ui';
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

  return useHotkeys(
    keys,
    (keyboardEvent, hotkeysEvent) => {
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
    },
    dependencies,
  );
};
