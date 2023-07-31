import { useHotkeys } from 'react-hotkeys-hook';
import {
  HotkeyCallback,
  Keys,
  Options,
  OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilState } from 'recoil';

import { pendingHotkeyState } from '../states/internal/pendingHotkeysState';

import { useScopedHotkeyCallback } from './useScopedHotkeyCallback';

export function useScopedHotkeys(
  keys: Keys,
  callback: HotkeyCallback,
  scope: string,
  dependencies?: OptionsOrDependencyArray,
  options: Options = {
    enableOnContentEditable: true,
    enableOnFormTags: true,
    preventDefault: true,
  },
) {
  const [pendingHotkey, setPendingHotkey] = useRecoilState(pendingHotkeyState);

  const callScopedHotkeyCallback = useScopedHotkeyCallback();

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
        preventDefault: !!options.preventDefault,
      });
    },
    {
      enableOnContentEditable: options.enableOnContentEditable,
      enableOnFormTags: options.enableOnFormTags,
    },
    dependencies,
  );
}
